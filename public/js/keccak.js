/*!
* Daytrader v1.0.0
* https://github.com/jeffallen6767/daytrader
*
* Copyright 2017 Jeffrey David Allen
*/
Daytrader.plugin('keccak', function(app) {
/*
keccak adapted from:

Pseudo-code description @ http://keccak.noekeon.org/specs_summary.html

Sponge construction @ http://sponge.noekeon.org/

Diagram of state @ http://keccak.noekeon.org/Keccak-f-PiecesOfState.pdf

NOTE: JavaScript has no 64-bit unsigned integer datatype, 
so we represent them as [uInt32Lo, uInt32Hi]

*/

var 
  // rounds of permutation to apply
  KECCAK_ROUNDS = 24,
  // width of state ( row )
  ROWS_X = 5,
  // height of state ( column )
  COLS_Y = 5,
  // depth of state ( lane )
  BITS_Z = 64,
  // # of bits in a byte
  BITS_IN_BYTE = 8,
  // # of bits in 2 byte hex
  BITS_IN_2_HEX_BYTES = 16,
  // # of bits in uInt32
  BITS_IN_UINT32 = 32,
  // # of uInt32 in uInt64
  UINT32_IN_UINT64 = 2,
  // # of bytes in uInt64
  UINT64_BYTES = BITS_Z / BITS_IN_BYTE,
  // # of bytes in uInt32
  UINT32_BYTES = UINT64_BYTES / UINT32_IN_UINT64,
  // # of bytes in horizontal slice of state ( plane )
  BYTES_PER_PLANE = ROWS_X * UINT64_BYTES,
  // # of bytes in state ( entire 3d construct )
  NUM_STATE_BYTES = COLS_Y * BYTES_PER_PLANE,
  // # of uInt32 in state ( 2 for each uInt64, i.e. [uInt32Lo, uInt32Hi]
  NUM_STATE_UINT32 = NUM_STATE_BYTES / UINT32_BYTES,
  // # of uInt32 in horizontal plane
  UINT32_OFFSET_Y = NUM_STATE_UINT32 / COLS_Y,
  // pad bytes
  SHA_PAD_FIRST_BYTE = 0x06,
  SHA_PAD_LAST_BYTE = 0x80,
  SHAKE_PAD_FIRST_BYTE = 0x1F,
  SHAKE_PAD_LAST_BYTE = 0x80,
  // mode types
  GET_SHA_HASH = 0,
  SET_SHAKE_MODE = 1,
  GET_SHAKE_HASH = 2,
  // input types
  INPUT_TYPE_STRING = 0,
  INPUT_TYPE_BYTE_NUMBER = 1,
  INPUT_TYPE_BYTE_STRING = 2,
  // all the data for each keccak mode
  KECCAK_MODES = {
    "SHA-3-224":{
      
    }, 
    "SHA-3-256":{
      
    }, 
    "SHA-3-384":{
      
    }, 
    "SHA-3-512":{
      
    },
    "SHAKE-128":{
      
    },
    "SHAKE-256":{
      
    }
  },
  // all the keccak mode names
  KECCAK_MODE_KEYS = Object.keys(KECCAK_MODES),
  SHAKE_MODE_PREFIX = "SHAKE",
  // The uInt64 round constants  as [uInt32Lo, uInt32Hi]
  CONST_IOTA = [
    [0x00000001,0x00000000], // 0x0000000000000001
    [0x00008082,0x00000000], // 0x0000000000008082
    [0x0000808a,0x80000000], // 0x800000000000808A
    [0x80008000,0x80000000], // 0x8000000080008000
    [0x0000808b,0x00000000], // 0x000000000000808B
    [0x80000001,0x00000000], // 0x0000000080000001
    [0x80008081,0x80000000], // 0x8000000080008081
    [0x00008009,0x80000000], // 0x8000000000008009
    [0x0000008a,0x00000000], // 0x000000000000008A
    [0x00000088,0x00000000], // 0x0000000000000088
    [0x80008009,0x00000000], // 0x0000000080008009
    [0x8000000a,0x00000000], // 0x000000008000000A
    [0x8000808b,0x00000000], // 0x000000008000808B
    [0x0000008b,0x80000000], // 0x800000000000008B
    [0x00008089,0x80000000], // 0x8000000000008089
    [0x00008003,0x80000000], // 0x8000000000008003
    [0x00008002,0x80000000], // 0x8000000000008002
    [0x00000080,0x80000000], // 0x8000000000000080
    [0x0000800a,0x00000000], // 0x000000000000800A
    [0x8000000a,0x80000000], // 0x800000008000000A
    [0x80008081,0x80000000], // 0x8000000080008081
    [0x00008080,0x80000000], // 0x8000000000008080
    [0x80000001,0x00000000], // 0x0000000080000001
    [0x80008008,0x80000000]  // 0x8000000080008008
  ],
  // The number of positions to bitwise-rotate-left the uInt64 @ [x,y]
  CONST_RHO = [
    0, 1, 62, 28, 27,  // y=0, x=0..4
    36, 44, 6, 55, 20, // y=1, x=0..4
    3, 10, 43, 25, 39, // y=2, x=0..4
    41, 45, 15, 21, 8, // y=3, x=0..4
    18, 2, 61, 56, 14  // y=4, x=0..4
  ],
  // The pi offsets uInt64[lo,hi] @ [x,y] moves to new position
  CONST_PI = [
    0,1, 20,21, 40,41, 10,11, 30,31, // y=0, x=0..4
    32,33, 2,3, 22,23, 42,43, 12,13, // y=1, x=0..4
    14,15, 34,35, 4,5, 24,25, 44,45, // y=2, x=0..4
    46,47, 16,17, 36,37, 6,7, 26,27, // y=3, x=0..4
    28,29, 48,49, 18,19, 38,39, 8,9  // y=4, x=0..4
  ];

// bitwise-rotate-left rot positions a uInt64 as uInt32Lo, uInt32Hi
function ROTL64(lo, hi, rot) {
  // if zero, just return copy of input
  if (rot < 1) {
    return [lo, hi];
  }
  var 
    // if rot >= 32 switch lo and hi bytes, and rotate mod 32
    which = rot < BITS_IN_UINT32 ? 1 : 0,
    one = which ? rot : rot - BITS_IN_UINT32, 
    two = BITS_IN_UINT32 - one,
    tmp;
  if (!which) {
    tmp = lo;
    lo = hi;
    hi = tmp;
  }
  return [lo << one | hi >>> two, hi << one | lo >>> two];
}

// the permutation function
function sha3_keccakf(A) {
  var 
    // temp modified copy of A ( rho step )
    B = [],
    // temp values for theta step: 5x[int32Lo,int32Hi]
    C = [[0,0],[0,0],[0,0],[0,0],[0,0]],
    // temp values for theta step: 5x[int32Lo,int32Hi]
    D = [[0,0],[0,0],[0,0],[0,0],[0,0]],
    // temp modified copy of B ( pi step )
    E = [],
    // int32Lo = index 0
    lo = 0,
    // int32Hi = index 1
    hi = 1,
    // main permutation round counter
    i,
    // temp values and references
    k,p,q,r,s,t,u,v,w,x,y,z;
  
  for (i=0; i<KECCAK_ROUNDS; i++) {
    
    /* represent 25 (5x5) uInt64 as a flat array of uInt32
       x,y maps to A[0..49], A[0] = int32Lo, A[1] = int32Hi of [x0,y0]
      0  1    2  3    4  5    6  7    8  9
    [x0,y0],[x1,y0],[x2,y0],[x3,y0],[x4,y0]
     10 11   12 13   14 15   16 17   18 19
    [x0,y1],[x1,y1],[x2,y1],[x3,y1],[x4,y1]
     20 21   22 23   24 25   26 27   28 29
    [x0,y2],[x1,y2],[x2,y2],[x3,y2],[x4,y2]
     30 31   32 33   34 35   36 37   38 39
    [x0,y3],[x1,y3],[x2,y3],[x3,y3],[x4,y3]
     40 41   42 43   44 45   46 47   48 49
    [x0,y4],[x1,y4],[x2,y4],[x3,y4],[x4,y4]
    */
    
    // θ (theta) step, see: http://keccak.noekeon.org/Keccak-f-Theta.pdf
    for (x=0; x<ROWS_X; x++) {
      // C[x] = A[x,0] xor A[x,1] xor A[x,2] xor A[x,3] xor A[x,4]
      z = x * 2;
      C[x][lo] = A[z] ^ A[z+10] ^ A[z+20] ^ A[z+30] ^ A[z+40];
      C[x][hi] = A[z+1] ^ A[z+11] ^ A[z+21] ^ A[z+31] ^ A[z+41];
    }
    for (x=0; x<ROWS_X; x++) {
      // D[x] = C[x-1] xor rot(C[x+1],1)
      /*
      x=0,w=4,z=1
      x=1,w=0,z=2
      x=2,w=1,z=3
      x=3,w=2,z=4
      x=4,w=3,z=0
      */
      w = (x + 4) % ROWS_X;
      z = (x + 1) % ROWS_X;
      t = D[x];
      u = C[w];
      k = C[z];
      v = ROTL64(k[lo], k[hi], 1);
      r = t[lo] = u[lo] ^ v[lo];
      p = t[hi] = u[hi] ^ v[hi];
      s = x * UINT32_IN_UINT64;
      for (y=0; y<COLS_Y; y++) {
        // A[x,y] = A[x,y] xor D[x]
        q = s + y * UINT32_OFFSET_Y;
        A[q] ^= r;
        A[q+1] ^= p;
      }
    }
    
    // ρ (rho) step, see: http://keccak.noekeon.org/Keccak-f-Rho.pdf
    for (y=0; y<COLS_Y; y++) {
      p = y * UINT32_OFFSET_Y; // column
      for (x=0; x<ROWS_X; x++) {
        q = p + (x * UINT32_IN_UINT64); // low
        r = q + 1; // high
        s = A[q];
        t = A[r];
        u = y * ROWS_X;
        v = u + x;
        w = CONST_RHO[v];
        z = ROTL64(s, t, w);
        B[q] = z[lo] >>> 0;
        B[r] = z[hi] >>> 0;
      }
    }
    
    /*
    26 27 28 29 20 21 22 23 24 25
    [3,2] [4,2] [0,2] [1,2] [2,2]
    
    16 17 18 19 10 11 12 13 14 15
    [3,1] [4,1] [0,1] [1,1] [2,1]
    
     6 7   8 9   0 1   2 3   4 5
    [3,0] [4,0] [0,0] [1,0] [2,0]
    
    46 47 48 49 40 41 42 43 44 45
    [3,4] [4,4] [0,4] [1,4] [2,4]
    
    36 37 38 39 30 31 32 33 34 35
    [3,3] [4,3] [0,3] [1,3] [2,3]
    */
    // π (pi) step, see: http://keccak.noekeon.org/Keccak-f-Pi.pdf
    for (y=0; y<COLS_Y; y++) {
      p = y * UINT32_OFFSET_Y; // column
      for (x=0; x<ROWS_X; x++) {
        q = p + (x * UINT32_IN_UINT64); // low
        r = q + 1; // high
        s = CONST_PI[q];
        t = s + 1;
        E[s] = B[q];
        E[t] = B[r];
      }
    }
    
    // χ (chi) step, see: http://keccak.noekeon.org/Keccak-f-Chi.pdf
    for (y=0; y<COLS_Y; y++) {
      p = y * UINT32_OFFSET_Y; // column
      for (x=0; x<ROWS_X; x++) {
        
        //y=1,p=10,x=0,q=0,r=10,s=12,t=14
        //y=1,p=10,x=1,q=2,r=12,s=14,t=16
        //y=1,p=10,x=2,q=4,r=14,s=16,t=18
        //y=1,p=10,x=3,q=6,r=16,s=18,t=10
        //y=1,p=10,x=4,q=8,r=18,s=10,t=12
        
        // calc the indexes
        r = p + (x * UINT32_IN_UINT64);
        s = p + (((x + 1) % ROWS_X) * UINT32_IN_UINT64);
        t = p + (((x + 2) % ROWS_X) * UINT32_IN_UINT64);
        
        u = r + 1;
        v = s + 1;
        w = t + 1;
        // lows
        A[r] = E[r] ^ ((~E[s]) & E[t]);
        // highs
        A[u] = E[u] ^ ((~E[v]) & E[w]);
      }
    }
    
    // ι (iota) step
    p = CONST_IOTA[i];
    A[0] ^= p[lo];
    A[1] ^= p[hi];
  }
}

// the keccak constructor for all modes
var keccak = {
  "mode": function(mode, optionalCallback) {
    // check for proper mode
    if (KECCAK_MODE_KEYS.indexOf(mode) === -1) {
      throw new Error("Keccak.mode requires one of: " + KECCAK_MODE_KEYS.join());
    }
    var 
      // calc modetype and bitsize of state construct based on mode
      parts = mode.split("-"),
      // mode type
      modeType = parts[0],
      // mode bit size
      modeBits = parts[parts.length-1] - 0,
      // length of digest (hash) requested ( in bytes )
      modeBytes = modeBits / BITS_IN_BYTE,
      // state as array buffer of bytes, with 2 typed-array views
      state, 
      // uInt8 view ( byte - used for setting data / reading hash digest )
      uInt8state, 
      // uInt32 view ( int32 - used for bitwise operations in permutation function )
      uInt32state,
      // bytes of size for sponge function
      rsiz = NUM_STATE_BYTES - UINT32_IN_UINT64 * modeBytes, 
      // current data pointer
      pt,
      // length of data
      len,
      // loop
      i, j,
      // shake mode
      modeShake,
      // create an instance of the mode
      instance = {
        "meta": {
          "mode": mode,
          "modeType": modeType,
          "modeBits": modeBits,
          "modeBytes": modeBytes,
          "rsiz": rsiz
        },
        // init resets everything for a new run
        "init": function(optionalCallback) {
          // A new ArrayBuffer object of size, in bytes, of the array buffer to create.. Its contents are initialized to 0.
          // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
          state = new ArrayBuffer(NUM_STATE_BYTES);
          // create 2 views of the bits, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
          // 1st, a 8 bit unsigned integer view, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
          uInt8state = new Uint8Array(state);
          // 2nd, a 32 bit unsigned integer view, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array
          uInt32state = new Uint32Array(state);
          // current byte pointer
          pt = 0;
          // shake mode?
          modeShake = modeType === SHAKE_MODE_PREFIX ? SET_SHAKE_MODE : GET_SHA_HASH;
          // handle async or sync call
          return typeof optionalCallback === "function" ? optionalCallback(instance) : instance;
        },
        // update can be called multiple times
        "update": function(input, optionalCallback) {
          // length of input
          len = input.length;
          // index of current
          j = pt;
          // accept string or array of byte values
          if (typeof input === "string") {
            for (i = 0; i < len; i++) {
              // save value
              uInt8state[j++] ^= input.charCodeAt(i);;
              // check for sponge limit
              if (j >= rsiz) {
                // apply permutation function
                sha3_keccakf(uInt32state);
                // reset current index
                j = 0;
              }
            }
          } else if (typeof input[0] === "number") {
            for (i = 0; i < len; i++) {
              // save value
              uInt8state[j++] ^= input[i];
              // check for sponge limit
              if (j >= rsiz) {
                // apply permutation function
                sha3_keccakf(uInt32state);
                // reset current index
                j = 0;
              }
            }
          } else if (typeof input[0] === "string") {
            for (i = 0; i < len; i++) {
              // save value
              uInt8state[j++] ^= parseInt(input[i], BITS_IN_2_HEX_BYTES);
              // check for sponge limit
              if (j >= rsiz) {
                // apply permutation function
                sha3_keccakf(uInt32state);
                // reset current index
                j = 0;
              }
            }
          } else {
            throw new Error([
              "update accepts string 'abc'",
              "array decimal [97,98,99]",
              "array hex [0x61,0x62,0x63]",
              "array octal [0237, 057, 0314]",
              "array string hex ['61','62','63'] only!"
            ].join(", "));
          }
          // save current index value
          pt = j;
          // handle async or sync call
          return typeof optionalCallback === "function" ? optionalCallback(instance) : instance;
        },
        // digest is called at the end to return the hash of input
        "digest": function() {
          var 
            args = [].slice.call(arguments),
            hash = [],
            tmp,
            num,
            optionalCallback;
          // choose mode, SHA or SHAKE
          switch (modeShake) {
            case SET_SHAKE_MODE:
              // set first pad byte
              uInt8state[pt] ^= SHAKE_PAD_FIRST_BYTE;
              // set last pad byte
              uInt8state[rsiz - 1] ^= SHAKE_PAD_LAST_BYTE;
              // apply permutation function
              sha3_keccakf(uInt32state);
              // reset pointer
              pt = 0;
              // increment shake mode
              modeShake = GET_SHAKE_HASH;
              // we fall-through here on purpose...
            case GET_SHAKE_HASH:
              //console.log("shakeout", typeof args[0], typeof args[1]);
              // get number of bytes to output if provided, fallback to bytes for mode
              num = typeof args[0] === "number" ? args[0] : modeBytes;
              // point at 1st output byte
              j = pt;
              // number of bytes to output
              for (i = 0; i < num; i++) {
                // are we at capacity?
                if (j >=rsiz) {
                  // apply permutation function
                  sha3_keccakf(uInt32state);
                  // reset pointer
                  j = 0;
                }
                tmp = uInt8state[j++].toString(BITS_IN_2_HEX_BYTES);
                len = tmp.length;
                hash[i] = "00".substr(len) + tmp;
              }
              // save current pointer
              pt = j;
              // called async?
              optionalCallback = args[args.length-1];
              break;
            case GET_SHA_HASH:
            default:
              // set first pad byte
              uInt8state[pt] ^= SHA_PAD_FIRST_BYTE;
              // set last pad byte
              uInt8state[rsiz - 1] ^= SHA_PAD_LAST_BYTE;
              // apply permutation function
              sha3_keccakf(uInt32state);
              // copy bytes to hash as hex
              for (i = 0; i < modeBytes; i++) {
                tmp = uInt8state[i].toString(BITS_IN_2_HEX_BYTES);
                len = tmp.length;
                hash[i] = "00".substr(len) + tmp;
              }
              // called async?
              optionalCallback = args[0];
              break;
          }
          // create string hash
          tmp = hash.join("");
          // handle async or sync call
          return typeof optionalCallback === "function" ? optionalCallback(tmp) : tmp;
        }
      };
    // handle async or sync call
    return typeof optionalCallback === "function" ? optionalCallback(instance) : instance;
  }
};
// make module visible
return keccak;

});