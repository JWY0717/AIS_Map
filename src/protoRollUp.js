var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var indexMinimal = {};

var minimal$1 = {};

var aspromise;
var hasRequiredAspromise;

function requireAspromise () {
	if (hasRequiredAspromise) return aspromise;
	hasRequiredAspromise = 1;
	aspromise = asPromise;

	/**
	 * Callback as used by {@link util.asPromise}.
	 * @typedef asPromiseCallback
	 * @type {function}
	 * @param {Error|null} error Error, if any
	 * @param {...*} params Additional arguments
	 * @returns {undefined}
	 */

	/**
	 * Returns a promise from a node-style callback function.
	 * @memberof util
	 * @param {asPromiseCallback} fn Function to call
	 * @param {*} ctx Function context
	 * @param {...*} params Function arguments
	 * @returns {Promise<*>} Promisified function
	 */
	function asPromise(fn, ctx/*, varargs */) {
	    var params  = new Array(arguments.length - 1),
	        offset  = 0,
	        index   = 2,
	        pending = true;
	    while (index < arguments.length)
	        params[offset++] = arguments[index++];
	    return new Promise(function executor(resolve, reject) {
	        params[offset] = function callback(err/*, varargs */) {
	            if (pending) {
	                pending = false;
	                if (err)
	                    reject(err);
	                else {
	                    var params = new Array(arguments.length - 1),
	                        offset = 0;
	                    while (offset < params.length)
	                        params[offset++] = arguments[offset];
	                    resolve.apply(null, params);
	                }
	            }
	        };
	        try {
	            fn.apply(ctx || null, params);
	        } catch (err) {
	            if (pending) {
	                pending = false;
	                reject(err);
	            }
	        }
	    });
	}
	return aspromise;
}

var base64$1 = {};

var hasRequiredBase64;

function requireBase64 () {
	if (hasRequiredBase64) return base64$1;
	hasRequiredBase64 = 1;
	(function (exports) {

		/**
		 * A minimal base64 implementation for number arrays.
		 * @memberof util
		 * @namespace
		 */
		var base64 = exports;

		/**
		 * Calculates the byte length of a base64 encoded string.
		 * @param {string} string Base64 encoded string
		 * @returns {number} Byte length
		 */
		base64.length = function length(string) {
		    var p = string.length;
		    if (!p)
		        return 0;
		    var n = 0;
		    while (--p % 4 > 1 && string.charAt(p) === "=")
		        ++n;
		    return Math.ceil(string.length * 3) / 4 - n;
		};

		// Base64 encoding table
		var b64 = new Array(64);

		// Base64 decoding table
		var s64 = new Array(123);

		// 65..90, 97..122, 48..57, 43, 47
		for (var i = 0; i < 64;)
		    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

		/**
		 * Encodes a buffer to a base64 encoded string.
		 * @param {Uint8Array} buffer Source buffer
		 * @param {number} start Source start
		 * @param {number} end Source end
		 * @returns {string} Base64 encoded string
		 */
		base64.encode = function encode(buffer, start, end) {
		    var parts = null,
		        chunk = [];
		    var i = 0, // output index
		        j = 0, // goto index
		        t;     // temporary
		    while (start < end) {
		        var b = buffer[start++];
		        switch (j) {
		            case 0:
		                chunk[i++] = b64[b >> 2];
		                t = (b & 3) << 4;
		                j = 1;
		                break;
		            case 1:
		                chunk[i++] = b64[t | b >> 4];
		                t = (b & 15) << 2;
		                j = 2;
		                break;
		            case 2:
		                chunk[i++] = b64[t | b >> 6];
		                chunk[i++] = b64[b & 63];
		                j = 0;
		                break;
		        }
		        if (i > 8191) {
		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
		            i = 0;
		        }
		    }
		    if (j) {
		        chunk[i++] = b64[t];
		        chunk[i++] = 61;
		        if (j === 1)
		            chunk[i++] = 61;
		    }
		    if (parts) {
		        if (i)
		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
		        return parts.join("");
		    }
		    return String.fromCharCode.apply(String, chunk.slice(0, i));
		};

		var invalidEncoding = "invalid encoding";

		/**
		 * Decodes a base64 encoded string to a buffer.
		 * @param {string} string Source string
		 * @param {Uint8Array} buffer Destination buffer
		 * @param {number} offset Destination offset
		 * @returns {number} Number of bytes written
		 * @throws {Error} If encoding is invalid
		 */
		base64.decode = function decode(string, buffer, offset) {
		    var start = offset;
		    var j = 0, // goto index
		        t;     // temporary
		    for (var i = 0; i < string.length;) {
		        var c = string.charCodeAt(i++);
		        if (c === 61 && j > 1)
		            break;
		        if ((c = s64[c]) === undefined)
		            throw Error(invalidEncoding);
		        switch (j) {
		            case 0:
		                t = c;
		                j = 1;
		                break;
		            case 1:
		                buffer[offset++] = t << 2 | (c & 48) >> 4;
		                t = c;
		                j = 2;
		                break;
		            case 2:
		                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
		                t = c;
		                j = 3;
		                break;
		            case 3:
		                buffer[offset++] = (t & 3) << 6 | c;
		                j = 0;
		                break;
		        }
		    }
		    if (j === 1)
		        throw Error(invalidEncoding);
		    return offset - start;
		};

		/**
		 * Tests if the specified string appears to be base64 encoded.
		 * @param {string} string String to test
		 * @returns {boolean} `true` if probably base64 encoded, otherwise false
		 */
		base64.test = function test(string) {
		    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
		}; 
	} (base64$1));
	return base64$1;
}

var eventemitter;
var hasRequiredEventemitter;

function requireEventemitter () {
	if (hasRequiredEventemitter) return eventemitter;
	hasRequiredEventemitter = 1;
	eventemitter = EventEmitter;

	/**
	 * Constructs a new event emitter instance.
	 * @classdesc A minimal event emitter.
	 * @memberof util
	 * @constructor
	 */
	function EventEmitter() {

	    /**
	     * Registered listeners.
	     * @type {Object.<string,*>}
	     * @private
	     */
	    this._listeners = {};
	}

	/**
	 * Registers an event listener.
	 * @param {string} evt Event name
	 * @param {function} fn Listener
	 * @param {*} [ctx] Listener context
	 * @returns {util.EventEmitter} `this`
	 */
	EventEmitter.prototype.on = function on(evt, fn, ctx) {
	    (this._listeners[evt] || (this._listeners[evt] = [])).push({
	        fn  : fn,
	        ctx : ctx || this
	    });
	    return this;
	};

	/**
	 * Removes an event listener or any matching listeners if arguments are omitted.
	 * @param {string} [evt] Event name. Removes all listeners if omitted.
	 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
	 * @returns {util.EventEmitter} `this`
	 */
	EventEmitter.prototype.off = function off(evt, fn) {
	    if (evt === undefined)
	        this._listeners = {};
	    else {
	        if (fn === undefined)
	            this._listeners[evt] = [];
	        else {
	            var listeners = this._listeners[evt];
	            for (var i = 0; i < listeners.length;)
	                if (listeners[i].fn === fn)
	                    listeners.splice(i, 1);
	                else
	                    ++i;
	        }
	    }
	    return this;
	};

	/**
	 * Emits an event by calling its listeners with the specified arguments.
	 * @param {string} evt Event name
	 * @param {...*} args Arguments
	 * @returns {util.EventEmitter} `this`
	 */
	EventEmitter.prototype.emit = function emit(evt) {
	    var listeners = this._listeners[evt];
	    if (listeners) {
	        var args = [],
	            i = 1;
	        for (; i < arguments.length;)
	            args.push(arguments[i++]);
	        for (i = 0; i < listeners.length;)
	            listeners[i].fn.apply(listeners[i++].ctx, args);
	    }
	    return this;
	};
	return eventemitter;
}

var float;
var hasRequiredFloat;

function requireFloat () {
	if (hasRequiredFloat) return float;
	hasRequiredFloat = 1;

	float = factory(factory);

	/**
	 * Reads / writes floats / doubles from / to buffers.
	 * @name util.float
	 * @namespace
	 */

	/**
	 * Writes a 32 bit float to a buffer using little endian byte order.
	 * @name util.float.writeFloatLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 32 bit float to a buffer using big endian byte order.
	 * @name util.float.writeFloatBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 32 bit float from a buffer using little endian byte order.
	 * @name util.float.readFloatLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 32 bit float from a buffer using big endian byte order.
	 * @name util.float.readFloatBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Writes a 64 bit double to a buffer using little endian byte order.
	 * @name util.float.writeDoubleLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 64 bit double to a buffer using big endian byte order.
	 * @name util.float.writeDoubleBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 64 bit double from a buffer using little endian byte order.
	 * @name util.float.readDoubleLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 64 bit double from a buffer using big endian byte order.
	 * @name util.float.readDoubleBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	// Factory function for the purpose of node-based testing in modified global environments
	function factory(exports) {

	    // float: typed array
	    if (typeof Float32Array !== "undefined") (function() {

	        var f32 = new Float32Array([ -0 ]),
	            f8b = new Uint8Array(f32.buffer),
	            le  = f8b[3] === 128;

	        function writeFloat_f32_cpy(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	        }

	        function writeFloat_f32_rev(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[3];
	            buf[pos + 1] = f8b[2];
	            buf[pos + 2] = f8b[1];
	            buf[pos + 3] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

	        function readFloat_f32_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            return f32[0];
	        }

	        function readFloat_f32_rev(buf, pos) {
	            f8b[3] = buf[pos    ];
	            f8b[2] = buf[pos + 1];
	            f8b[1] = buf[pos + 2];
	            f8b[0] = buf[pos + 3];
	            return f32[0];
	        }

	        /* istanbul ignore next */
	        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

	    // float: ieee754
	    })(); else (function() {

	        function writeFloat_ieee754(writeUint, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0)
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
	            else if (isNaN(val))
	                writeUint(2143289344, buf, pos);
	            else if (val > 3.4028234663852886e+38) // +-Infinity
	                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
	            else if (val < 1.1754943508222875e-38) // denormal
	                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
	            else {
	                var exponent = Math.floor(Math.log(val) / Math.LN2),
	                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
	                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
	            }
	        }

	        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
	        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

	        function readFloat_ieee754(readUint, buf, pos) {
	            var uint = readUint(buf, pos),
	                sign = (uint >> 31) * 2 + 1,
	                exponent = uint >>> 23 & 255,
	                mantissa = uint & 8388607;
	            return exponent === 255
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 1.401298464324817e-45 * mantissa
	                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
	        }

	        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
	        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

	    })();

	    // double: typed array
	    if (typeof Float64Array !== "undefined") (function() {

	        var f64 = new Float64Array([-0]),
	            f8b = new Uint8Array(f64.buffer),
	            le  = f8b[7] === 128;

	        function writeDouble_f64_cpy(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	            buf[pos + 4] = f8b[4];
	            buf[pos + 5] = f8b[5];
	            buf[pos + 6] = f8b[6];
	            buf[pos + 7] = f8b[7];
	        }

	        function writeDouble_f64_rev(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[7];
	            buf[pos + 1] = f8b[6];
	            buf[pos + 2] = f8b[5];
	            buf[pos + 3] = f8b[4];
	            buf[pos + 4] = f8b[3];
	            buf[pos + 5] = f8b[2];
	            buf[pos + 6] = f8b[1];
	            buf[pos + 7] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

	        function readDouble_f64_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            f8b[4] = buf[pos + 4];
	            f8b[5] = buf[pos + 5];
	            f8b[6] = buf[pos + 6];
	            f8b[7] = buf[pos + 7];
	            return f64[0];
	        }

	        function readDouble_f64_rev(buf, pos) {
	            f8b[7] = buf[pos    ];
	            f8b[6] = buf[pos + 1];
	            f8b[5] = buf[pos + 2];
	            f8b[4] = buf[pos + 3];
	            f8b[3] = buf[pos + 4];
	            f8b[2] = buf[pos + 5];
	            f8b[1] = buf[pos + 6];
	            f8b[0] = buf[pos + 7];
	            return f64[0];
	        }

	        /* istanbul ignore next */
	        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

	    // double: ieee754
	    })(); else (function() {

	        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0) {
	                writeUint(0, buf, pos + off0);
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
	            } else if (isNaN(val)) {
	                writeUint(0, buf, pos + off0);
	                writeUint(2146959360, buf, pos + off1);
	            } else if (val > 1.7976931348623157e+308) { // +-Infinity
	                writeUint(0, buf, pos + off0);
	                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
	            } else {
	                var mantissa;
	                if (val < 2.2250738585072014e-308) { // denormal
	                    mantissa = val / 5e-324;
	                    writeUint(mantissa >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
	                } else {
	                    var exponent = Math.floor(Math.log(val) / Math.LN2);
	                    if (exponent === 1024)
	                        exponent = 1023;
	                    mantissa = val * Math.pow(2, -exponent);
	                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
	                }
	            }
	        }

	        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
	        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

	        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
	            var lo = readUint(buf, pos + off0),
	                hi = readUint(buf, pos + off1);
	            var sign = (hi >> 31) * 2 + 1,
	                exponent = hi >>> 20 & 2047,
	                mantissa = 4294967296 * (hi & 1048575) + lo;
	            return exponent === 2047
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 5e-324 * mantissa
	                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
	        }

	        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
	        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

	    })();

	    return exports;
	}

	// uint helpers

	function writeUintLE(val, buf, pos) {
	    buf[pos    ] =  val        & 255;
	    buf[pos + 1] =  val >>> 8  & 255;
	    buf[pos + 2] =  val >>> 16 & 255;
	    buf[pos + 3] =  val >>> 24;
	}

	function writeUintBE(val, buf, pos) {
	    buf[pos    ] =  val >>> 24;
	    buf[pos + 1] =  val >>> 16 & 255;
	    buf[pos + 2] =  val >>> 8  & 255;
	    buf[pos + 3] =  val        & 255;
	}

	function readUintLE(buf, pos) {
	    return (buf[pos    ]
	          | buf[pos + 1] << 8
	          | buf[pos + 2] << 16
	          | buf[pos + 3] << 24) >>> 0;
	}

	function readUintBE(buf, pos) {
	    return (buf[pos    ] << 24
	          | buf[pos + 1] << 16
	          | buf[pos + 2] << 8
	          | buf[pos + 3]) >>> 0;
	}
	return float;
}

var inquire_1;
var hasRequiredInquire;

function requireInquire () {
	if (hasRequiredInquire) return inquire_1;
	hasRequiredInquire = 1;
	inquire_1 = inquire;

	/**
	 * Requires a module only if available.
	 * @memberof util
	 * @param {string} moduleName Module to require
	 * @returns {?Object} Required module if available and not empty, otherwise `null`
	 */
	function inquire(moduleName) {
	    try {
	        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
	        if (mod && (mod.length || Object.keys(mod).length))
	            return mod;
	    } catch (e) {} // eslint-disable-line no-empty
	    return null;
	}
	return inquire_1;
}

var utf8$2 = {};

var hasRequiredUtf8;

function requireUtf8 () {
	if (hasRequiredUtf8) return utf8$2;
	hasRequiredUtf8 = 1;
	(function (exports) {

		/**
		 * A minimal UTF8 implementation for number arrays.
		 * @memberof util
		 * @namespace
		 */
		var utf8 = exports;

		/**
		 * Calculates the UTF8 byte length of a string.
		 * @param {string} string String
		 * @returns {number} Byte length
		 */
		utf8.length = function utf8_length(string) {
		    var len = 0,
		        c = 0;
		    for (var i = 0; i < string.length; ++i) {
		        c = string.charCodeAt(i);
		        if (c < 128)
		            len += 1;
		        else if (c < 2048)
		            len += 2;
		        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
		            ++i;
		            len += 4;
		        } else
		            len += 3;
		    }
		    return len;
		};

		/**
		 * Reads UTF8 bytes as a string.
		 * @param {Uint8Array} buffer Source buffer
		 * @param {number} start Source start
		 * @param {number} end Source end
		 * @returns {string} String read
		 */
		utf8.read = function utf8_read(buffer, start, end) {
		    var len = end - start;
		    if (len < 1)
		        return "";
		    var parts = null,
		        chunk = [],
		        i = 0, // char offset
		        t;     // temporary
		    while (start < end) {
		        t = buffer[start++];
		        if (t < 128)
		            chunk[i++] = t;
		        else if (t > 191 && t < 224)
		            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
		        else if (t > 239 && t < 365) {
		            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
		            chunk[i++] = 0xD800 + (t >> 10);
		            chunk[i++] = 0xDC00 + (t & 1023);
		        } else
		            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
		        if (i > 8191) {
		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
		            i = 0;
		        }
		    }
		    if (parts) {
		        if (i)
		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
		        return parts.join("");
		    }
		    return String.fromCharCode.apply(String, chunk.slice(0, i));
		};

		/**
		 * Writes a string as UTF8 bytes.
		 * @param {string} string Source string
		 * @param {Uint8Array} buffer Destination buffer
		 * @param {number} offset Destination offset
		 * @returns {number} Bytes written
		 */
		utf8.write = function utf8_write(string, buffer, offset) {
		    var start = offset,
		        c1, // character 1
		        c2; // character 2
		    for (var i = 0; i < string.length; ++i) {
		        c1 = string.charCodeAt(i);
		        if (c1 < 128) {
		            buffer[offset++] = c1;
		        } else if (c1 < 2048) {
		            buffer[offset++] = c1 >> 6       | 192;
		            buffer[offset++] = c1       & 63 | 128;
		        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
		            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
		            ++i;
		            buffer[offset++] = c1 >> 18      | 240;
		            buffer[offset++] = c1 >> 12 & 63 | 128;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        } else {
		            buffer[offset++] = c1 >> 12      | 224;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        }
		    }
		    return offset - start;
		}; 
	} (utf8$2));
	return utf8$2;
}

var pool_1;
var hasRequiredPool;

function requirePool () {
	if (hasRequiredPool) return pool_1;
	hasRequiredPool = 1;
	pool_1 = pool;

	/**
	 * An allocator as used by {@link util.pool}.
	 * @typedef PoolAllocator
	 * @type {function}
	 * @param {number} size Buffer size
	 * @returns {Uint8Array} Buffer
	 */

	/**
	 * A slicer as used by {@link util.pool}.
	 * @typedef PoolSlicer
	 * @type {function}
	 * @param {number} start Start offset
	 * @param {number} end End offset
	 * @returns {Uint8Array} Buffer slice
	 * @this {Uint8Array}
	 */

	/**
	 * A general purpose buffer pool.
	 * @memberof util
	 * @function
	 * @param {PoolAllocator} alloc Allocator
	 * @param {PoolSlicer} slice Slicer
	 * @param {number} [size=8192] Slab size
	 * @returns {PoolAllocator} Pooled allocator
	 */
	function pool(alloc, slice, size) {
	    var SIZE   = size || 8192;
	    var MAX    = SIZE >>> 1;
	    var slab   = null;
	    var offset = SIZE;
	    return function pool_alloc(size) {
	        if (size < 1 || size > MAX)
	            return alloc(size);
	        if (offset + size > SIZE) {
	            slab = alloc(SIZE);
	            offset = 0;
	        }
	        var buf = slice.call(slab, offset, offset += size);
	        if (offset & 7) // align to 32 bit
	            offset = (offset | 7) + 1;
	        return buf;
	    };
	}
	return pool_1;
}

var longbits;
var hasRequiredLongbits;

function requireLongbits () {
	if (hasRequiredLongbits) return longbits;
	hasRequiredLongbits = 1;
	longbits = LongBits;

	var util = requireMinimal();

	/**
	 * Constructs new long bits.
	 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
	 * @memberof util
	 * @constructor
	 * @param {number} lo Low 32 bits, unsigned
	 * @param {number} hi High 32 bits, unsigned
	 */
	function LongBits(lo, hi) {

	    // note that the casts below are theoretically unnecessary as of today, but older statically
	    // generated converter code might still call the ctor with signed 32bits. kept for compat.

	    /**
	     * Low bits.
	     * @type {number}
	     */
	    this.lo = lo >>> 0;

	    /**
	     * High bits.
	     * @type {number}
	     */
	    this.hi = hi >>> 0;
	}

	/**
	 * Zero bits.
	 * @memberof util.LongBits
	 * @type {util.LongBits}
	 */
	var zero = LongBits.zero = new LongBits(0, 0);

	zero.toNumber = function() { return 0; };
	zero.zzEncode = zero.zzDecode = function() { return this; };
	zero.length = function() { return 1; };

	/**
	 * Zero hash.
	 * @memberof util.LongBits
	 * @type {string}
	 */
	var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

	/**
	 * Constructs new long bits from the specified number.
	 * @param {number} value Value
	 * @returns {util.LongBits} Instance
	 */
	LongBits.fromNumber = function fromNumber(value) {
	    if (value === 0)
	        return zero;
	    var sign = value < 0;
	    if (sign)
	        value = -value;
	    var lo = value >>> 0,
	        hi = (value - lo) / 4294967296 >>> 0;
	    if (sign) {
	        hi = ~hi >>> 0;
	        lo = ~lo >>> 0;
	        if (++lo > 4294967295) {
	            lo = 0;
	            if (++hi > 4294967295)
	                hi = 0;
	        }
	    }
	    return new LongBits(lo, hi);
	};

	/**
	 * Constructs new long bits from a number, long or string.
	 * @param {Long|number|string} value Value
	 * @returns {util.LongBits} Instance
	 */
	LongBits.from = function from(value) {
	    if (typeof value === "number")
	        return LongBits.fromNumber(value);
	    if (util.isString(value)) {
	        /* istanbul ignore else */
	        if (util.Long)
	            value = util.Long.fromString(value);
	        else
	            return LongBits.fromNumber(parseInt(value, 10));
	    }
	    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
	};

	/**
	 * Converts this long bits to a possibly unsafe JavaScript number.
	 * @param {boolean} [unsigned=false] Whether unsigned or not
	 * @returns {number} Possibly unsafe number
	 */
	LongBits.prototype.toNumber = function toNumber(unsigned) {
	    if (!unsigned && this.hi >>> 31) {
	        var lo = ~this.lo + 1 >>> 0,
	            hi = ~this.hi     >>> 0;
	        if (!lo)
	            hi = hi + 1 >>> 0;
	        return -(lo + hi * 4294967296);
	    }
	    return this.lo + this.hi * 4294967296;
	};

	/**
	 * Converts this long bits to a long.
	 * @param {boolean} [unsigned=false] Whether unsigned or not
	 * @returns {Long} Long
	 */
	LongBits.prototype.toLong = function toLong(unsigned) {
	    return util.Long
	        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
	        /* istanbul ignore next */
	        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
	};

	var charCodeAt = String.prototype.charCodeAt;

	/**
	 * Constructs new long bits from the specified 8 characters long hash.
	 * @param {string} hash Hash
	 * @returns {util.LongBits} Bits
	 */
	LongBits.fromHash = function fromHash(hash) {
	    if (hash === zeroHash)
	        return zero;
	    return new LongBits(
	        ( charCodeAt.call(hash, 0)
	        | charCodeAt.call(hash, 1) << 8
	        | charCodeAt.call(hash, 2) << 16
	        | charCodeAt.call(hash, 3) << 24) >>> 0
	    ,
	        ( charCodeAt.call(hash, 4)
	        | charCodeAt.call(hash, 5) << 8
	        | charCodeAt.call(hash, 6) << 16
	        | charCodeAt.call(hash, 7) << 24) >>> 0
	    );
	};

	/**
	 * Converts this long bits to a 8 characters long hash.
	 * @returns {string} Hash
	 */
	LongBits.prototype.toHash = function toHash() {
	    return String.fromCharCode(
	        this.lo        & 255,
	        this.lo >>> 8  & 255,
	        this.lo >>> 16 & 255,
	        this.lo >>> 24      ,
	        this.hi        & 255,
	        this.hi >>> 8  & 255,
	        this.hi >>> 16 & 255,
	        this.hi >>> 24
	    );
	};

	/**
	 * Zig-zag encodes this long bits.
	 * @returns {util.LongBits} `this`
	 */
	LongBits.prototype.zzEncode = function zzEncode() {
	    var mask =   this.hi >> 31;
	    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
	    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
	    return this;
	};

	/**
	 * Zig-zag decodes this long bits.
	 * @returns {util.LongBits} `this`
	 */
	LongBits.prototype.zzDecode = function zzDecode() {
	    var mask = -(this.lo & 1);
	    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
	    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
	    return this;
	};

	/**
	 * Calculates the length of this longbits when encoded as a varint.
	 * @returns {number} Length
	 */
	LongBits.prototype.length = function length() {
	    var part0 =  this.lo,
	        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
	        part2 =  this.hi >>> 24;
	    return part2 === 0
	         ? part1 === 0
	           ? part0 < 16384
	             ? part0 < 128 ? 1 : 2
	             : part0 < 2097152 ? 3 : 4
	           : part1 < 16384
	             ? part1 < 128 ? 5 : 6
	             : part1 < 2097152 ? 7 : 8
	         : part2 < 128 ? 9 : 10;
	};
	return longbits;
}

var hasRequiredMinimal;

function requireMinimal () {
	if (hasRequiredMinimal) return minimal$1;
	hasRequiredMinimal = 1;
	(function (exports) {
		var util = exports;

		// used to return a Promise where callback is omitted
		util.asPromise = requireAspromise();

		// converts to / from base64 encoded strings
		util.base64 = requireBase64();

		// base class of rpc.Service
		util.EventEmitter = requireEventemitter();

		// float handling accross browsers
		util.float = requireFloat();

		// requires modules optionally and hides the call from bundlers
		util.inquire = requireInquire();

		// converts to / from utf8 encoded strings
		util.utf8 = requireUtf8();

		// provides a node-like buffer pool in the browser
		util.pool = requirePool();

		// utility to work with the low and high bits of a 64 bit value
		util.LongBits = requireLongbits();

		/**
		 * Whether running within node or not.
		 * @memberof util
		 * @type {boolean}
		 */
		util.isNode = Boolean(typeof commonjsGlobal !== "undefined"
		                   && commonjsGlobal
		                   && commonjsGlobal.process
		                   && commonjsGlobal.process.versions
		                   && commonjsGlobal.process.versions.node);

		/**
		 * Global object reference.
		 * @memberof util
		 * @type {Object}
		 */
		util.global = util.isNode && commonjsGlobal
		           || typeof window !== "undefined" && window
		           || typeof self   !== "undefined" && self
		           || commonjsGlobal; // eslint-disable-line no-invalid-this

		/**
		 * An immuable empty array.
		 * @memberof util
		 * @type {Array.<*>}
		 * @const
		 */
		util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

		/**
		 * An immutable empty object.
		 * @type {Object}
		 * @const
		 */
		util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

		/**
		 * Tests if the specified value is an integer.
		 * @function
		 * @param {*} value Value to test
		 * @returns {boolean} `true` if the value is an integer
		 */
		util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
		    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
		};

		/**
		 * Tests if the specified value is a string.
		 * @param {*} value Value to test
		 * @returns {boolean} `true` if the value is a string
		 */
		util.isString = function isString(value) {
		    return typeof value === "string" || value instanceof String;
		};

		/**
		 * Tests if the specified value is a non-null object.
		 * @param {*} value Value to test
		 * @returns {boolean} `true` if the value is a non-null object
		 */
		util.isObject = function isObject(value) {
		    return value && typeof value === "object";
		};

		/**
		 * Checks if a property on a message is considered to be present.
		 * This is an alias of {@link util.isSet}.
		 * @function
		 * @param {Object} obj Plain object or message instance
		 * @param {string} prop Property name
		 * @returns {boolean} `true` if considered to be present, otherwise `false`
		 */
		util.isset =

		/**
		 * Checks if a property on a message is considered to be present.
		 * @param {Object} obj Plain object or message instance
		 * @param {string} prop Property name
		 * @returns {boolean} `true` if considered to be present, otherwise `false`
		 */
		util.isSet = function isSet(obj, prop) {
		    var value = obj[prop];
		    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
		        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
		    return false;
		};

		/**
		 * Any compatible Buffer instance.
		 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
		 * @interface Buffer
		 * @extends Uint8Array
		 */

		/**
		 * Node's Buffer class if available.
		 * @type {Constructor<Buffer>}
		 */
		util.Buffer = (function() {
		    try {
		        var Buffer = util.inquire("buffer").Buffer;
		        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
		        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
		    } catch (e) {
		        /* istanbul ignore next */
		        return null;
		    }
		})();

		// Internal alias of or polyfull for Buffer.from.
		util._Buffer_from = null;

		// Internal alias of or polyfill for Buffer.allocUnsafe.
		util._Buffer_allocUnsafe = null;

		/**
		 * Creates a new buffer of whatever type supported by the environment.
		 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
		 * @returns {Uint8Array|Buffer} Buffer
		 */
		util.newBuffer = function newBuffer(sizeOrArray) {
		    /* istanbul ignore next */
		    return typeof sizeOrArray === "number"
		        ? util.Buffer
		            ? util._Buffer_allocUnsafe(sizeOrArray)
		            : new util.Array(sizeOrArray)
		        : util.Buffer
		            ? util._Buffer_from(sizeOrArray)
		            : typeof Uint8Array === "undefined"
		                ? sizeOrArray
		                : new Uint8Array(sizeOrArray);
		};

		/**
		 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
		 * @type {Constructor<Uint8Array>}
		 */
		util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

		/**
		 * Any compatible Long instance.
		 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
		 * @interface Long
		 * @property {number} low Low bits
		 * @property {number} high High bits
		 * @property {boolean} unsigned Whether unsigned or not
		 */

		/**
		 * Long.js's Long class if available.
		 * @type {Constructor<Long>}
		 */
		util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
		         || /* istanbul ignore next */ util.global.Long
		         || util.inquire("long");

		/**
		 * Regular expression used to verify 2 bit (`bool`) map keys.
		 * @type {RegExp}
		 * @const
		 */
		util.key2Re = /^true|false|0|1$/;

		/**
		 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
		 * @type {RegExp}
		 * @const
		 */
		util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

		/**
		 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
		 * @type {RegExp}
		 * @const
		 */
		util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

		/**
		 * Converts a number or long to an 8 characters long hash string.
		 * @param {Long|number} value Value to convert
		 * @returns {string} Hash
		 */
		util.longToHash = function longToHash(value) {
		    return value
		        ? util.LongBits.from(value).toHash()
		        : util.LongBits.zeroHash;
		};

		/**
		 * Converts an 8 characters long hash string to a long or number.
		 * @param {string} hash Hash
		 * @param {boolean} [unsigned=false] Whether unsigned or not
		 * @returns {Long|number} Original value
		 */
		util.longFromHash = function longFromHash(hash, unsigned) {
		    var bits = util.LongBits.fromHash(hash);
		    if (util.Long)
		        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
		    return bits.toNumber(Boolean(unsigned));
		};

		/**
		 * Merges the properties of the source object into the destination object.
		 * @memberof util
		 * @param {Object.<string,*>} dst Destination object
		 * @param {Object.<string,*>} src Source object
		 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
		 * @returns {Object.<string,*>} Destination object
		 */
		function merge(dst, src, ifNotSet) { // used by converters
		    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
		        if (dst[keys[i]] === undefined || !ifNotSet)
		            dst[keys[i]] = src[keys[i]];
		    return dst;
		}

		util.merge = merge;

		/**
		 * Converts the first character of a string to lower case.
		 * @param {string} str String to convert
		 * @returns {string} Converted string
		 */
		util.lcFirst = function lcFirst(str) {
		    return str.charAt(0).toLowerCase() + str.substring(1);
		};

		/**
		 * Creates a custom error constructor.
		 * @memberof util
		 * @param {string} name Error name
		 * @returns {Constructor<Error>} Custom error constructor
		 */
		function newError(name) {

		    function CustomError(message, properties) {

		        if (!(this instanceof CustomError))
		            return new CustomError(message, properties);

		        // Error.call(this, message);
		        // ^ just returns a new error instance because the ctor can be called as a function

		        Object.defineProperty(this, "message", { get: function() { return message; } });

		        /* istanbul ignore next */
		        if (Error.captureStackTrace) // node
		            Error.captureStackTrace(this, CustomError);
		        else
		            Object.defineProperty(this, "stack", { value: new Error().stack || "" });

		        if (properties)
		            merge(this, properties);
		    }

		    CustomError.prototype = Object.create(Error.prototype, {
		        constructor: {
		            value: CustomError,
		            writable: true,
		            enumerable: false,
		            configurable: true,
		        },
		        name: {
		            get: function get() { return name; },
		            set: undefined,
		            enumerable: false,
		            // configurable: false would accurately preserve the behavior of
		            // the original, but I'm guessing that was not intentional.
		            // For an actual error subclass, this property would
		            // be configurable.
		            configurable: true,
		        },
		        toString: {
		            value: function value() { return this.name + ": " + this.message; },
		            writable: true,
		            enumerable: false,
		            configurable: true,
		        },
		    });

		    return CustomError;
		}

		util.newError = newError;

		/**
		 * Constructs a new protocol error.
		 * @classdesc Error subclass indicating a protocol specifc error.
		 * @memberof util
		 * @extends Error
		 * @template T extends Message<T>
		 * @constructor
		 * @param {string} message Error message
		 * @param {Object.<string,*>} [properties] Additional properties
		 * @example
		 * try {
		 *     MyMessage.decode(someBuffer); // throws if required fields are missing
		 * } catch (e) {
		 *     if (e instanceof ProtocolError && e.instance)
		 *         console.log("decoded so far: " + JSON.stringify(e.instance));
		 * }
		 */
		util.ProtocolError = newError("ProtocolError");

		/**
		 * So far decoded message instance.
		 * @name util.ProtocolError#instance
		 * @type {Message<T>}
		 */

		/**
		 * A OneOf getter as returned by {@link util.oneOfGetter}.
		 * @typedef OneOfGetter
		 * @type {function}
		 * @returns {string|undefined} Set field name, if any
		 */

		/**
		 * Builds a getter for a oneof's present field name.
		 * @param {string[]} fieldNames Field names
		 * @returns {OneOfGetter} Unbound getter
		 */
		util.oneOfGetter = function getOneOf(fieldNames) {
		    var fieldMap = {};
		    for (var i = 0; i < fieldNames.length; ++i)
		        fieldMap[fieldNames[i]] = 1;

		    /**
		     * @returns {string|undefined} Set field name, if any
		     * @this Object
		     * @ignore
		     */
		    return function() { // eslint-disable-line consistent-return
		        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
		            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
		                return keys[i];
		    };
		};

		/**
		 * A OneOf setter as returned by {@link util.oneOfSetter}.
		 * @typedef OneOfSetter
		 * @type {function}
		 * @param {string|undefined} value Field name
		 * @returns {undefined}
		 */

		/**
		 * Builds a setter for a oneof's present field name.
		 * @param {string[]} fieldNames Field names
		 * @returns {OneOfSetter} Unbound setter
		 */
		util.oneOfSetter = function setOneOf(fieldNames) {

		    /**
		     * @param {string} name Field name
		     * @returns {undefined}
		     * @this Object
		     * @ignore
		     */
		    return function(name) {
		        for (var i = 0; i < fieldNames.length; ++i)
		            if (fieldNames[i] !== name)
		                delete this[fieldNames[i]];
		    };
		};

		/**
		 * Default conversion options used for {@link Message#toJSON} implementations.
		 *
		 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
		 *
		 * - Longs become strings
		 * - Enums become string keys
		 * - Bytes become base64 encoded strings
		 * - (Sub-)Messages become plain objects
		 * - Maps become plain objects with all string keys
		 * - Repeated fields become arrays
		 * - NaN and Infinity for float and double fields become strings
		 *
		 * @type {IConversionOptions}
		 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
		 */
		util.toJSONOptions = {
		    longs: String,
		    enums: String,
		    bytes: String,
		    json: true
		};

		// Sets up buffer utility according to the environment (called in index-minimal)
		util._configure = function() {
		    var Buffer = util.Buffer;
		    /* istanbul ignore if */
		    if (!Buffer) {
		        util._Buffer_from = util._Buffer_allocUnsafe = null;
		        return;
		    }
		    // because node 4.x buffers are incompatible & immutable
		    // see: https://github.com/dcodeIO/protobuf.js/pull/665
		    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
		        /* istanbul ignore next */
		        function Buffer_from(value, encoding) {
		            return new Buffer(value, encoding);
		        };
		    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
		        /* istanbul ignore next */
		        function Buffer_allocUnsafe(size) {
		            return new Buffer(size);
		        };
		}; 
	} (minimal$1));
	return minimal$1;
}

var writer = Writer$1;

var util$4      = requireMinimal();

var BufferWriter$1; // cyclic

var LongBits$1  = util$4.LongBits,
    base64    = util$4.base64,
    utf8$1      = util$4.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {State|null}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer$1() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {Object|null}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

var create$1 = function create() {
    return util$4.Buffer
        ? function create_buffer_setup() {
            return (Writer$1.create = function create_buffer() {
                return new BufferWriter$1();
            })();
        }
        /* istanbul ignore next */
        : function create_array() {
            return new Writer$1();
        };
};

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer$1.create = create$1();

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer$1.alloc = function alloc(size) {
    return new util$4.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util$4.Array !== Array)
    Writer$1.alloc = util$4.pool(Writer$1.alloc, util$4.Array.prototype.subarray);

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 * @private
 */
Writer$1.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.int32 = function write_int32(value) {
    return value < 0
        ? this._push(writeVarint64, 10, LongBits$1.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.uint64 = function write_uint64(value) {
    var bits = LongBits$1.from(value);
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.int64 = Writer$1.prototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.sint64 = function write_sint64(value) {
    var bits = LongBits$1.from(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.bool = function write_bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos    ] =  val         & 255;
    buf[pos + 1] =  val >>> 8   & 255;
    buf[pos + 2] =  val >>> 16  & 255;
    buf[pos + 3] =  val >>> 24;
}

/**
 * Writes an unsigned 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.fixed32 = function write_fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a signed 32 bit value as fixed 32 bits.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32;

/**
 * Writes an unsigned 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits$1.from(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a signed 64 bit value as fixed 64 bits.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64;

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.float = function write_float(value) {
    return this._push(util$4.float.writeFloatLE, 4, value);
};

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.double = function write_double(value) {
    return this._push(util$4.float.writeDoubleLE, 8, value);
};

var writeBytes = util$4.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this._push(writeByte, 1, 0);
    if (util$4.isString(value)) {
        var buf = Writer$1.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.string = function write_string(value) {
    var len = utf8$1.length(value);
    return len
        ? this.uint32(len)._push(utf8$1.write, len, value)
        : this._push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
Writer$1.prototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
Writer$1.prototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
Writer$1.prototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
Writer$1.prototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

Writer$1._configure = function(BufferWriter_) {
    BufferWriter$1 = BufferWriter_;
    Writer$1.create = create$1();
    BufferWriter$1._configure();
};

var writer_buffer = BufferWriter;

// extends Writer
var Writer = writer;
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

var util$3 = requireMinimal();

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

BufferWriter._configure = function () {
    /**
     * Allocates a buffer of the specified size.
     * @function
     * @param {number} size Buffer size
     * @returns {Buffer} Buffer
     */
    BufferWriter.alloc = util$3._Buffer_allocUnsafe;

    BufferWriter.writeBytesBuffer = util$3.Buffer && util$3.Buffer.prototype instanceof Uint8Array && util$3.Buffer.prototype.set.name === "set"
        ? function writeBytesBuffer_set(val, buf, pos) {
          buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
          // also works for plain array values
        }
        /* istanbul ignore next */
        : function writeBytesBuffer_copy(val, buf, pos) {
          if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
          else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
        };
};


/**
 * @override
 */
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    if (util$3.isString(value))
        value = util$3._Buffer_from(value, "base64");
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util$3.utf8.write(val, buf, pos);
    else if (buf.utf8Write)
        buf.utf8Write(val, pos);
    else
        buf.write(val, pos);
}

/**
 * @override
 */
BufferWriter.prototype.string = function write_string_buffer(value) {
    var len = util$3.Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this._push(writeStringBuffer, len, value);
    return this;
};


/**
 * Finishes the write operation.
 * @name BufferWriter#finish
 * @function
 * @returns {Buffer} Finished buffer
 */

BufferWriter._configure();

var reader = Reader$1;

var util$2      = requireMinimal();

var BufferReader$1; // cyclic

var LongBits  = util$2.LongBits,
    utf8      = util$2.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader$1(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
            return new Reader$1(buffer);
        throw Error("illegal buffer");
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        if (Array.isArray(buffer))
            return new Reader$1(buffer);
        throw Error("illegal buffer");
    };

var create = function create() {
    return util$2.Buffer
        ? function create_buffer_setup(buffer) {
            return (Reader$1.create = function create_buffer(buffer) {
                return util$2.Buffer.isBuffer(buffer)
                    ? new BufferReader$1(buffer)
                    /* istanbul ignore next */
                    : create_array(buffer);
            })(buffer);
        }
        /* istanbul ignore next */
        : create_array;
};

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array|Buffer} buffer Buffer to read from
 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 * @throws {Error} If `buffer` is not a valid buffer
 */
Reader$1.create = create();

Reader$1.prototype._slice = util$2.Array.prototype.subarray || /* istanbul ignore next */ util$2.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore if */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader$1.prototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader$1.prototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0, 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
Reader$1.prototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as an unsigned 32 bit integer.
 * @returns {number} Value read
 */
Reader$1.prototype.fixed32 = function read_fixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4);
};

/**
 * Reads fixed 32 bits as a signed 32 bit integer.
 * @returns {number} Value read
 */
Reader$1.prototype.sfixed32 = function read_sfixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4) | 0;
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.float = function read_float() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util$2.float.readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
};

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.double = function read_double() {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util$2.float.readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
Reader$1.prototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore if */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    if (Array.isArray(this.buf)) // plain array
        return this.buf.slice(start, end);
    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
        ? new this.buf.constructor(0)
        : this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
Reader$1.prototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
Reader$1.prototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore if */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        do {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
Reader$1.prototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
                this.skipType(wireType);
            }
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

Reader$1._configure = function(BufferReader_) {
    BufferReader$1 = BufferReader_;
    Reader$1.create = create();
    BufferReader$1._configure();

    var fn = util$2.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    util$2.merge(Reader$1.prototype, {

        int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
        },

        uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
        },

        sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
        },

        fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
        },

        sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
        }

    });
};

var reader_buffer = BufferReader;

// extends Reader
var Reader = reader;
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

var util$1 = requireMinimal();

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);

    /**
     * Read buffer.
     * @name BufferReader#buf
     * @type {Buffer}
     */
}

BufferReader._configure = function () {
    /* istanbul ignore else */
    if (util$1.Buffer)
        BufferReader.prototype._slice = util$1.Buffer.prototype.slice;
};


/**
 * @override
 */
BufferReader.prototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice
        ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len))
        : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @name BufferReader#bytes
 * @function
 * @returns {Buffer} Value read
 */

BufferReader._configure();

var rpc = {};

var service = Service;

var util = requireMinimal();

// Extends EventEmitter
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

/**
 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
 *
 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
 * @typedef rpc.ServiceMethodCallback
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {TRes} [response] Response message
 * @returns {undefined}
 */

/**
 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
 * @typedef rpc.ServiceMethod
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
 */

/**
 * Constructs a new RPC service instance.
 * @classdesc An RPC service as returned by {@link Service#create}.
 * @exports rpc.Service
 * @extends util.EventEmitter
 * @constructor
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Service(rpcImpl, requestDelimited, responseDelimited) {

    if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");

    util.EventEmitter.call(this);

    /**
     * RPC implementation. Becomes `null` once the service is ended.
     * @type {RPCImpl|null}
     */
    this.rpcImpl = rpcImpl;

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
 * @param {Constructor<TReq>} requestCtor Request constructor
 * @param {Constructor<TRes>} responseCtor Response constructor
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
 * @returns {undefined}
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 */
Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    if (!request)
        throw TypeError("request must be specified");

    var self = this;
    if (!callback)
        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    if (!self.rpcImpl) {
        setTimeout(function() { callback(Error("already ended")); }, 0);
        return undefined;
    }

    try {
        return self.rpcImpl(
            method,
            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {

                if (err) {
                    self.emit("error", err, method);
                    return callback(err);
                }

                if (response === null) {
                    self.end(/* endedByRPC */ true);
                    return undefined;
                }

                if (!(response instanceof responseCtor)) {
                    try {
                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
                    } catch (err) {
                        self.emit("error", err, method);
                        return callback(err);
                    }
                }

                self.emit("data", response, method);
                return callback(null, response);
            }
        );
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};

/**
 * Ends this service and emits the `end` event.
 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
 * @returns {rpc.Service} `this`
 */
Service.prototype.end = function end(endedByRPC) {
    if (this.rpcImpl) {
        if (!endedByRPC) // signal end to rpcImpl
            this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
    }
    return this;
};

(function (exports) {

	/**
	 * Streaming RPC helpers.
	 * @namespace
	 */
	var rpc = exports;

	/**
	 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
	 * @typedef RPCImpl
	 * @type {function}
	 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
	 * @param {Uint8Array} requestData Request data
	 * @param {RPCImplCallback} callback Callback function
	 * @returns {undefined}
	 * @example
	 * function rpcImpl(method, requestData, callback) {
	 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
	 *         throw Error("no such method");
	 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
	 *         callback(err, responseData);
	 *     });
	 * }
	 */

	/**
	 * Node-style callback as used by {@link RPCImpl}.
	 * @typedef RPCImplCallback
	 * @type {function}
	 * @param {Error|null} error Error, if any, otherwise `null`
	 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
	 * @returns {undefined}
	 */

	rpc.Service = service; 
} (rpc));

var roots = {};

(function (exports) {
	var protobuf = exports;

	/**
	 * Build type, one of `"full"`, `"light"` or `"minimal"`.
	 * @name build
	 * @type {string}
	 * @const
	 */
	protobuf.build = "minimal";

	// Serialization
	protobuf.Writer       = writer;
	protobuf.BufferWriter = writer_buffer;
	protobuf.Reader       = reader;
	protobuf.BufferReader = reader_buffer;

	// Utility
	protobuf.util         = requireMinimal();
	protobuf.rpc          = rpc;
	protobuf.roots        = roots;
	protobuf.configure    = configure;

	/* istanbul ignore next */
	/**
	 * Reconfigures the library according to the environment.
	 * @returns {undefined}
	 */
	function configure() {
	    protobuf.util._configure();
	    protobuf.Writer._configure(protobuf.BufferWriter);
	    protobuf.Reader._configure(protobuf.BufferReader);
	}

	// Set up buffer utility according to the environment
	configure(); 
} (indexMinimal));

var minimal = indexMinimal;

/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/

var $protobuf = minimal;

// Common aliases
var $Reader = $protobuf.Reader,
  $Writer = $protobuf.Writer,
  $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.web_gis = (function () {
  /**
   * Namespace web_gis.
   * @exports web_gis
   * @namespace
   */
  var web_gis = {};

  /**
   * MessageType enum.
   * @name web_gis.MessageType
   * @enum {number}
   * @property {number} AIS=0 AIS value
   * @property {number} LOST=1 LOST value
   * @property {number} RADAR=2 RADAR value
   */
  web_gis.MessageType = (function () {
    var valuesById = {},
      values = Object.create(valuesById);
    values[(valuesById[0] = "AIS")] = 0;
    values[(valuesById[1] = "LOST")] = 1;
    values[(valuesById[2] = "RADAR")] = 2;
    return values;
  })();

  web_gis.AIS_BASE = (function () {
    /**
     * Properties of a AIS_BASE.
     * @memberof web_gis
     * @interface IAIS_BASE
     * @property {number} mmsi AIS_BASE mmsi
     * @property {number} posX AIS_BASE posX
     * @property {number} posY AIS_BASE posY
     * @property {number} cog AIS_BASE cog
     * @property {number} sog AIS_BASE sog
     * @property {number} trueheading AIS_BASE trueheading
     * @property {string} shipName AIS_BASE shipName
     * @property {number} shipType AIS_BASE shipType
     * @property {boolean} isMerge AIS_BASE isMerge
     * @property {web_gis.AIS_BASE.TargetType} isRadar AIS_BASE isRadar
     * @property {number} leftTopX AIS_BASE leftTopX
     * @property {number} leftTopY AIS_BASE leftTopY
     * @property {number} leftBottomX AIS_BASE leftBottomX
     * @property {number} leftBottomY AIS_BASE leftBottomY
     * @property {number} rightBottomX AIS_BASE rightBottomX
     * @property {number} rightBottomY AIS_BASE rightBottomY
     * @property {number} rightTopX AIS_BASE rightTopX
     * @property {number} rightTopY AIS_BASE rightTopY
     * @property {number} centerTopX AIS_BASE centerTopX
     * @property {number} centerTopY AIS_BASE centerTopY
     */

    /**
     * Constructs a new AIS_BASE.
     * @memberof web_gis
     * @classdesc Represents a AIS_BASE.
     * @implements IAIS_BASE
     * @constructor
     * @param {web_gis.IAIS_BASE=} [properties] Properties to set
     */
    function AIS_BASE(properties) {
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * AIS_BASE mmsi.
     * @member {number} mmsi
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.mmsi = 0;

    /**
     * AIS_BASE posX.
     * @member {number} posX
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.posX = 0;

    /**
     * AIS_BASE posY.
     * @member {number} posY
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.posY = 0;

    /**
     * AIS_BASE cog.
     * @member {number} cog
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.cog = 0;

    /**
     * AIS_BASE sog.
     * @member {number} sog
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.sog = 0;

    /**
     * AIS_BASE trueheading.
     * @member {number} trueheading
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.trueheading = 0;

    /**
     * AIS_BASE shipName.
     * @member {string} shipName
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.shipName = "";

    /**
     * AIS_BASE shipType.
     * @member {number} shipType
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.shipType = 0;

    /**
     * AIS_BASE isMerge.
     * @member {boolean} isMerge
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.isMerge = false;

    /**
     * AIS_BASE isRadar.
     * @member {web_gis.AIS_BASE.TargetType} isRadar
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.isRadar = 0;

    /**
     * AIS_BASE leftTopX.
     * @member {number} leftTopX
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.leftTopX = 0;

    /**
     * AIS_BASE leftTopY.
     * @member {number} leftTopY
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.leftTopY = 0;

    /**
     * AIS_BASE leftBottomX.
     * @member {number} leftBottomX
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.leftBottomX = 0;

    /**
     * AIS_BASE leftBottomY.
     * @member {number} leftBottomY
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.leftBottomY = 0;

    /**
     * AIS_BASE rightBottomX.
     * @member {number} rightBottomX
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.rightBottomX = 0;

    /**
     * AIS_BASE rightBottomY.
     * @member {number} rightBottomY
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.rightBottomY = 0;

    /**
     * AIS_BASE rightTopX.
     * @member {number} rightTopX
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.rightTopX = 0;

    /**
     * AIS_BASE rightTopY.
     * @member {number} rightTopY
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.rightTopY = 0;

    /**
     * AIS_BASE centerTopX.
     * @member {number} centerTopX
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.centerTopX = 0;

    /**
     * AIS_BASE centerTopY.
     * @member {number} centerTopY
     * @memberof web_gis.AIS_BASE
     * @instance
     */
    AIS_BASE.prototype.centerTopY = 0;

    /**
     * Creates a new AIS_BASE instance using the specified properties.
     * @function create
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {web_gis.IAIS_BASE=} [properties] Properties to set
     * @returns {web_gis.AIS_BASE} AIS_BASE instance
     */
    AIS_BASE.create = function create(properties) {
      return new AIS_BASE(properties);
    };

    /**
     * Encodes the specified AIS_BASE message. Does not implicitly {@link web_gis.AIS_BASE.verify|verify} messages.
     * @function encode
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {web_gis.IAIS_BASE} message AIS_BASE message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AIS_BASE.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.mmsi);
      writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.posX);
      writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.posY);
      writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.cog);
      writer.uint32(/* id 5, wireType 5 =*/ 45).float(message.sog);
      writer.uint32(/* id 6, wireType 5 =*/ 53).float(message.trueheading);
      writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.shipName);
      writer.uint32(/* id 8, wireType 0 =*/ 64).int32(message.shipType);
      writer.uint32(/* id 9, wireType 0 =*/ 72).bool(message.isMerge);
      writer.uint32(/* id 10, wireType 0 =*/ 80).int32(message.isRadar);
      writer.uint32(/* id 11, wireType 0 =*/ 88).int32(message.leftTopX);
      writer.uint32(/* id 12, wireType 0 =*/ 96).int32(message.leftTopY);
      writer.uint32(/* id 13, wireType 0 =*/ 104).int32(message.leftBottomX);
      writer.uint32(/* id 14, wireType 0 =*/ 112).int32(message.leftBottomY);
      writer.uint32(/* id 15, wireType 0 =*/ 120).int32(message.rightBottomX);
      writer.uint32(/* id 16, wireType 0 =*/ 128).int32(message.rightBottomY);
      writer.uint32(/* id 17, wireType 0 =*/ 136).int32(message.rightTopX);
      writer.uint32(/* id 18, wireType 0 =*/ 144).int32(message.rightTopY);
      writer.uint32(/* id 19, wireType 0 =*/ 152).int32(message.centerTopX);
      writer.uint32(/* id 20, wireType 0 =*/ 160).int32(message.centerTopY);
      return writer;
    };

    /**
     * Encodes the specified AIS_BASE message, length delimited. Does not implicitly {@link web_gis.AIS_BASE.verify|verify} messages.
     * @function encodeDelimited
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {web_gis.IAIS_BASE} message AIS_BASE message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AIS_BASE.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a AIS_BASE message from the specified reader or buffer.
     * @function decode
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {web_gis.AIS_BASE} AIS_BASE
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AIS_BASE.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      var end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.web_gis.AIS_BASE();
      while (reader.pos < end) {
        var tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.mmsi = reader.int32();
            break;
          case 2:
            message.posX = reader.int32();
            break;
          case 3:
            message.posY = reader.int32();
            break;
          case 4:
            message.cog = reader.float();
            break;
          case 5:
            message.sog = reader.float();
            break;
          case 6:
            message.trueheading = reader.float();
            break;
          case 7:
            message.shipName = reader.string();
            break;
          case 8:
            message.shipType = reader.int32();
            break;
          case 9:
            message.isMerge = reader.bool();
            break;
          case 10:
            message.isRadar = reader.int32();
            break;
          case 11:
            message.leftTopX = reader.int32();
            break;
          case 12:
            message.leftTopY = reader.int32();
            break;
          case 13:
            message.leftBottomX = reader.int32();
            break;
          case 14:
            message.leftBottomY = reader.int32();
            break;
          case 15:
            message.rightBottomX = reader.int32();
            break;
          case 16:
            message.rightBottomY = reader.int32();
            break;
          case 17:
            message.rightTopX = reader.int32();
            break;
          case 18:
            message.rightTopY = reader.int32();
            break;
          case 19:
            message.centerTopX = reader.int32();
            break;
          case 20:
            message.centerTopY = reader.int32();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      if (!message.hasOwnProperty("mmsi"))
        throw $util.ProtocolError("missing required 'mmsi'", {
          instance: message,
        });
      if (!message.hasOwnProperty("posX"))
        throw $util.ProtocolError("missing required 'posX'", {
          instance: message,
        });
      if (!message.hasOwnProperty("posY"))
        throw $util.ProtocolError("missing required 'posY'", {
          instance: message,
        });
      if (!message.hasOwnProperty("cog"))
        throw $util.ProtocolError("missing required 'cog'", {
          instance: message,
        });
      if (!message.hasOwnProperty("sog"))
        throw $util.ProtocolError("missing required 'sog'", {
          instance: message,
        });
      if (!message.hasOwnProperty("trueheading"))
        throw $util.ProtocolError("missing required 'trueheading'", {
          instance: message,
        });
      if (!message.hasOwnProperty("shipName"))
        throw $util.ProtocolError("missing required 'shipName'", {
          instance: message,
        });
      if (!message.hasOwnProperty("shipType"))
        throw $util.ProtocolError("missing required 'shipType'", {
          instance: message,
        });
      if (!message.hasOwnProperty("isMerge"))
        throw $util.ProtocolError("missing required 'isMerge'", {
          instance: message,
        });
      if (!message.hasOwnProperty("isRadar"))
        throw $util.ProtocolError("missing required 'isRadar'", {
          instance: message,
        });
      if (!message.hasOwnProperty("leftTopX"))
        throw $util.ProtocolError("missing required 'leftTopX'", {
          instance: message,
        });
      if (!message.hasOwnProperty("leftTopY"))
        throw $util.ProtocolError("missing required 'leftTopY'", {
          instance: message,
        });
      if (!message.hasOwnProperty("leftBottomX"))
        throw $util.ProtocolError("missing required 'leftBottomX'", {
          instance: message,
        });
      if (!message.hasOwnProperty("leftBottomY"))
        throw $util.ProtocolError("missing required 'leftBottomY'", {
          instance: message,
        });
      if (!message.hasOwnProperty("rightBottomX"))
        throw $util.ProtocolError("missing required 'rightBottomX'", {
          instance: message,
        });
      if (!message.hasOwnProperty("rightBottomY"))
        throw $util.ProtocolError("missing required 'rightBottomY'", {
          instance: message,
        });
      if (!message.hasOwnProperty("rightTopX"))
        throw $util.ProtocolError("missing required 'rightTopX'", {
          instance: message,
        });
      if (!message.hasOwnProperty("rightTopY"))
        throw $util.ProtocolError("missing required 'rightTopY'", {
          instance: message,
        });
      if (!message.hasOwnProperty("centerTopX"))
        throw $util.ProtocolError("missing required 'centerTopX'", {
          instance: message,
        });
      if (!message.hasOwnProperty("centerTopY"))
        throw $util.ProtocolError("missing required 'centerTopY'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a AIS_BASE message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {web_gis.AIS_BASE} AIS_BASE
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AIS_BASE.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a AIS_BASE message.
     * @function verify
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AIS_BASE.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (!$util.isInteger(message.mmsi)) return "mmsi: integer expected";
      if (!$util.isInteger(message.posX)) return "posX: integer expected";
      if (!$util.isInteger(message.posY)) return "posY: integer expected";
      if (typeof message.cog !== "number") return "cog: number expected";
      if (typeof message.sog !== "number") return "sog: number expected";
      if (typeof message.trueheading !== "number")
        return "trueheading: number expected";
      if (!$util.isString(message.shipName)) return "shipName: string expected";
      if (!$util.isInteger(message.shipType))
        return "shipType: integer expected";
      if (typeof message.isMerge !== "boolean")
        return "isMerge: boolean expected";
      switch (message.isRadar) {
        default:
          return "isRadar: enum value expected";
        case 0:
        case 1:
          break;
      }
      if (!$util.isInteger(message.leftTopX))
        return "leftTopX: integer expected";
      if (!$util.isInteger(message.leftTopY))
        return "leftTopY: integer expected";
      if (!$util.isInteger(message.leftBottomX))
        return "leftBottomX: integer expected";
      if (!$util.isInteger(message.leftBottomY))
        return "leftBottomY: integer expected";
      if (!$util.isInteger(message.rightBottomX))
        return "rightBottomX: integer expected";
      if (!$util.isInteger(message.rightBottomY))
        return "rightBottomY: integer expected";
      if (!$util.isInteger(message.rightTopX))
        return "rightTopX: integer expected";
      if (!$util.isInteger(message.rightTopY))
        return "rightTopY: integer expected";
      if (!$util.isInteger(message.centerTopX))
        return "centerTopX: integer expected";
      if (!$util.isInteger(message.centerTopY))
        return "centerTopY: integer expected";
      return null;
    };

    /**
     * Creates a AIS_BASE message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {web_gis.AIS_BASE} AIS_BASE
     */
    AIS_BASE.fromObject = function fromObject(object) {
      if (object instanceof $root.web_gis.AIS_BASE) return object;
      var message = new $root.web_gis.AIS_BASE();
      if (object.mmsi != null) message.mmsi = object.mmsi | 0;
      if (object.posX != null) message.posX = object.posX | 0;
      if (object.posY != null) message.posY = object.posY | 0;
      if (object.cog != null) message.cog = Number(object.cog);
      if (object.sog != null) message.sog = Number(object.sog);
      if (object.trueheading != null)
        message.trueheading = Number(object.trueheading);
      if (object.shipName != null) message.shipName = String(object.shipName);
      if (object.shipType != null) message.shipType = object.shipType | 0;
      if (object.isMerge != null) message.isMerge = Boolean(object.isMerge);
      switch (object.isRadar) {
        case "NORMAL":
        case 0:
          message.isRadar = 0;
          break;
        case "RADAR":
        case 1:
          message.isRadar = 1;
          break;
      }
      if (object.leftTopX != null) message.leftTopX = object.leftTopX | 0;
      if (object.leftTopY != null) message.leftTopY = object.leftTopY | 0;
      if (object.leftBottomX != null)
        message.leftBottomX = object.leftBottomX | 0;
      if (object.leftBottomY != null)
        message.leftBottomY = object.leftBottomY | 0;
      if (object.rightBottomX != null)
        message.rightBottomX = object.rightBottomX | 0;
      if (object.rightBottomY != null)
        message.rightBottomY = object.rightBottomY | 0;
      if (object.rightTopX != null) message.rightTopX = object.rightTopX | 0;
      if (object.rightTopY != null) message.rightTopY = object.rightTopY | 0;
      if (object.centerTopX != null) message.centerTopX = object.centerTopX | 0;
      if (object.centerTopY != null) message.centerTopY = object.centerTopY | 0;
      return message;
    };

    /**
     * Creates a plain object from a AIS_BASE message. Also converts values to other types if specified.
     * @function toObject
     * @memberof web_gis.AIS_BASE
     * @static
     * @param {web_gis.AIS_BASE} message AIS_BASE
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AIS_BASE.toObject = function toObject(message, options) {
      if (!options) options = {};
      var object = {};
      if (options.defaults) {
        object.mmsi = 0;
        object.posX = 0;
        object.posY = 0;
        object.cog = 0;
        object.sog = 0;
        object.trueheading = 0;
        object.shipName = "";
        object.shipType = 0;
        object.isMerge = false;
        object.isRadar = options.enums === String ? "NORMAL" : 0;
        object.leftTopX = 0;
        object.leftTopY = 0;
        object.leftBottomX = 0;
        object.leftBottomY = 0;
        object.rightBottomX = 0;
        object.rightBottomY = 0;
        object.rightTopX = 0;
        object.rightTopY = 0;
        object.centerTopX = 0;
        object.centerTopY = 0;
      }
      if (message.mmsi != null && message.hasOwnProperty("mmsi"))
        object.mmsi = message.mmsi;
      if (message.posX != null && message.hasOwnProperty("posX"))
        object.posX = message.posX;
      if (message.posY != null && message.hasOwnProperty("posY"))
        object.posY = message.posY;
      if (message.cog != null && message.hasOwnProperty("cog"))
        object.cog =
          options.json && !isFinite(message.cog)
            ? String(message.cog)
            : message.cog;
      if (message.sog != null && message.hasOwnProperty("sog"))
        object.sog =
          options.json && !isFinite(message.sog)
            ? String(message.sog)
            : message.sog;
      if (message.trueheading != null && message.hasOwnProperty("trueheading"))
        object.trueheading =
          options.json && !isFinite(message.trueheading)
            ? String(message.trueheading)
            : message.trueheading;
      if (message.shipName != null && message.hasOwnProperty("shipName"))
        object.shipName = message.shipName;
      if (message.shipType != null && message.hasOwnProperty("shipType"))
        object.shipType = message.shipType;
      if (message.isMerge != null && message.hasOwnProperty("isMerge"))
        object.isMerge = message.isMerge;
      if (message.isRadar != null && message.hasOwnProperty("isRadar"))
        object.isRadar =
          options.enums === String
            ? $root.web_gis.AIS_BASE.TargetType[message.isRadar]
            : message.isRadar;
      if (message.leftTopX != null && message.hasOwnProperty("leftTopX"))
        object.leftTopX = message.leftTopX;
      if (message.leftTopY != null && message.hasOwnProperty("leftTopY"))
        object.leftTopY = message.leftTopY;
      if (message.leftBottomX != null && message.hasOwnProperty("leftBottomX"))
        object.leftBottomX = message.leftBottomX;
      if (message.leftBottomY != null && message.hasOwnProperty("leftBottomY"))
        object.leftBottomY = message.leftBottomY;
      if (
        message.rightBottomX != null &&
        message.hasOwnProperty("rightBottomX")
      )
        object.rightBottomX = message.rightBottomX;
      if (
        message.rightBottomY != null &&
        message.hasOwnProperty("rightBottomY")
      )
        object.rightBottomY = message.rightBottomY;
      if (message.rightTopX != null && message.hasOwnProperty("rightTopX"))
        object.rightTopX = message.rightTopX;
      if (message.rightTopY != null && message.hasOwnProperty("rightTopY"))
        object.rightTopY = message.rightTopY;
      if (message.centerTopX != null && message.hasOwnProperty("centerTopX"))
        object.centerTopX = message.centerTopX;
      if (message.centerTopY != null && message.hasOwnProperty("centerTopY"))
        object.centerTopY = message.centerTopY;
      return object;
    };

    /**
     * Converts this AIS_BASE to JSON.
     * @function toJSON
     * @memberof web_gis.AIS_BASE
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AIS_BASE.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * TargetType enum.
     * @name web_gis.AIS_BASE.TargetType
     * @enum {number}
     * @property {number} NORMAL=0 NORMAL value
     * @property {number} RADAR=1 RADAR value
     */
    AIS_BASE.TargetType = (function () {
      var valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = "NORMAL")] = 0;
      values[(valuesById[1] = "RADAR")] = 1;
      return values;
    })();

    return AIS_BASE;
  })();

  web_gis.LOST_SIGNAL = (function () {
    /**
     * Properties of a LOST_SIGNAL.
     * @memberof web_gis
     * @interface ILOST_SIGNAL
     * @property {number} mmsi LOST_SIGNAL mmsi
     */

    /**
     * Constructs a new LOST_SIGNAL.
     * @memberof web_gis
     * @classdesc Represents a LOST_SIGNAL.
     * @implements ILOST_SIGNAL
     * @constructor
     * @param {web_gis.ILOST_SIGNAL=} [properties] Properties to set
     */
    function LOST_SIGNAL(properties) {
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * LOST_SIGNAL mmsi.
     * @member {number} mmsi
     * @memberof web_gis.LOST_SIGNAL
     * @instance
     */
    LOST_SIGNAL.prototype.mmsi = 0;

    /**
     * Creates a new LOST_SIGNAL instance using the specified properties.
     * @function create
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {web_gis.ILOST_SIGNAL=} [properties] Properties to set
     * @returns {web_gis.LOST_SIGNAL} LOST_SIGNAL instance
     */
    LOST_SIGNAL.create = function create(properties) {
      return new LOST_SIGNAL(properties);
    };

    /**
     * Encodes the specified LOST_SIGNAL message. Does not implicitly {@link web_gis.LOST_SIGNAL.verify|verify} messages.
     * @function encode
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {web_gis.ILOST_SIGNAL} message LOST_SIGNAL message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LOST_SIGNAL.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.mmsi);
      return writer;
    };

    /**
     * Encodes the specified LOST_SIGNAL message, length delimited. Does not implicitly {@link web_gis.LOST_SIGNAL.verify|verify} messages.
     * @function encodeDelimited
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {web_gis.ILOST_SIGNAL} message LOST_SIGNAL message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LOST_SIGNAL.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a LOST_SIGNAL message from the specified reader or buffer.
     * @function decode
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {web_gis.LOST_SIGNAL} LOST_SIGNAL
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LOST_SIGNAL.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      var end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.web_gis.LOST_SIGNAL();
      while (reader.pos < end) {
        var tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.mmsi = reader.int32();
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("mmsi"))
        throw $util.ProtocolError("missing required 'mmsi'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a LOST_SIGNAL message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {web_gis.LOST_SIGNAL} LOST_SIGNAL
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LOST_SIGNAL.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LOST_SIGNAL message.
     * @function verify
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LOST_SIGNAL.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (!$util.isInteger(message.mmsi)) return "mmsi: integer expected";
      return null;
    };

    /**
     * Creates a LOST_SIGNAL message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {web_gis.LOST_SIGNAL} LOST_SIGNAL
     */
    LOST_SIGNAL.fromObject = function fromObject(object) {
      if (object instanceof $root.web_gis.LOST_SIGNAL) return object;
      var message = new $root.web_gis.LOST_SIGNAL();
      if (object.mmsi != null) message.mmsi = object.mmsi | 0;
      return message;
    };

    /**
     * Creates a plain object from a LOST_SIGNAL message. Also converts values to other types if specified.
     * @function toObject
     * @memberof web_gis.LOST_SIGNAL
     * @static
     * @param {web_gis.LOST_SIGNAL} message LOST_SIGNAL
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LOST_SIGNAL.toObject = function toObject(message, options) {
      if (!options) options = {};
      var object = {};
      if (options.defaults) object.mmsi = 0;
      if (message.mmsi != null && message.hasOwnProperty("mmsi"))
        object.mmsi = message.mmsi;
      return object;
    };

    /**
     * Converts this LOST_SIGNAL to JSON.
     * @function toJSON
     * @memberof web_gis.LOST_SIGNAL
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LOST_SIGNAL.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return LOST_SIGNAL;
  })();

  web_gis.RADAR_IMAGE = (function () {
    /**
     * Properties of a RADAR_IMAGE.
     * @memberof web_gis
     * @interface IRADAR_IMAGE
     * @property {number} siteId RADAR_IMAGE siteId
     * @property {Array.<web_gis.RADAR_IMAGE.IPosition>|null} [fragment] RADAR_IMAGE fragment
     */

    /**
     * Constructs a new RADAR_IMAGE.
     * @memberof web_gis
     * @classdesc Represents a RADAR_IMAGE.
     * @implements IRADAR_IMAGE
     * @constructor
     * @param {web_gis.IRADAR_IMAGE=} [properties] Properties to set
     */
    function RADAR_IMAGE(properties) {
      this.fragment = [];
      if (properties)
        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * RADAR_IMAGE siteId.
     * @member {number} siteId
     * @memberof web_gis.RADAR_IMAGE
     * @instance
     */
    RADAR_IMAGE.prototype.siteId = 0;

    /**
     * RADAR_IMAGE fragment.
     * @member {Array.<web_gis.RADAR_IMAGE.IPosition>} fragment
     * @memberof web_gis.RADAR_IMAGE
     * @instance
     */
    RADAR_IMAGE.prototype.fragment = $util.emptyArray;

    /**
     * Creates a new RADAR_IMAGE instance using the specified properties.
     * @function create
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {web_gis.IRADAR_IMAGE=} [properties] Properties to set
     * @returns {web_gis.RADAR_IMAGE} RADAR_IMAGE instance
     */
    RADAR_IMAGE.create = function create(properties) {
      return new RADAR_IMAGE(properties);
    };

    /**
     * Encodes the specified RADAR_IMAGE message. Does not implicitly {@link web_gis.RADAR_IMAGE.verify|verify} messages.
     * @function encode
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {web_gis.IRADAR_IMAGE} message RADAR_IMAGE message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RADAR_IMAGE.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.siteId);
      if (message.fragment != null && message.fragment.length)
        for (var i = 0; i < message.fragment.length; ++i)
          $root.web_gis.RADAR_IMAGE.Position.encode(
            message.fragment[i],
            writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
          ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified RADAR_IMAGE message, length delimited. Does not implicitly {@link web_gis.RADAR_IMAGE.verify|verify} messages.
     * @function encodeDelimited
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {web_gis.IRADAR_IMAGE} message RADAR_IMAGE message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RADAR_IMAGE.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RADAR_IMAGE message from the specified reader or buffer.
     * @function decode
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {web_gis.RADAR_IMAGE} RADAR_IMAGE
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RADAR_IMAGE.decode = function decode(reader, length) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      var end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.web_gis.RADAR_IMAGE();
      while (reader.pos < end) {
        var tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.siteId = reader.int32();
            break;
          case 2:
            if (!(message.fragment && message.fragment.length))
              message.fragment = [];
            message.fragment.push(
              $root.web_gis.RADAR_IMAGE.Position.decode(reader, reader.uint32())
            );
            break;
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("siteId"))
        throw $util.ProtocolError("missing required 'siteId'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a RADAR_IMAGE message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {web_gis.RADAR_IMAGE} RADAR_IMAGE
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RADAR_IMAGE.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RADAR_IMAGE message.
     * @function verify
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RADAR_IMAGE.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (!$util.isInteger(message.siteId)) return "siteId: integer expected";
      if (message.fragment != null && message.hasOwnProperty("fragment")) {
        if (!Array.isArray(message.fragment)) return "fragment: array expected";
        for (var i = 0; i < message.fragment.length; ++i) {
          var error = $root.web_gis.RADAR_IMAGE.Position.verify(
            message.fragment[i]
          );
          if (error) return "fragment." + error;
        }
      }
      return null;
    };

    /**
     * Creates a RADAR_IMAGE message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {web_gis.RADAR_IMAGE} RADAR_IMAGE
     */
    RADAR_IMAGE.fromObject = function fromObject(object) {
      if (object instanceof $root.web_gis.RADAR_IMAGE) return object;
      var message = new $root.web_gis.RADAR_IMAGE();
      if (object.siteId != null) message.siteId = object.siteId | 0;
      if (object.fragment) {
        if (!Array.isArray(object.fragment))
          throw TypeError(".web_gis.RADAR_IMAGE.fragment: array expected");
        message.fragment = [];
        for (var i = 0; i < object.fragment.length; ++i) {
          if (typeof object.fragment[i] !== "object")
            throw TypeError(".web_gis.RADAR_IMAGE.fragment: object expected");
          message.fragment[i] = $root.web_gis.RADAR_IMAGE.Position.fromObject(
            object.fragment[i]
          );
        }
      }
      return message;
    };

    /**
     * Creates a plain object from a RADAR_IMAGE message. Also converts values to other types if specified.
     * @function toObject
     * @memberof web_gis.RADAR_IMAGE
     * @static
     * @param {web_gis.RADAR_IMAGE} message RADAR_IMAGE
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RADAR_IMAGE.toObject = function toObject(message, options) {
      if (!options) options = {};
      var object = {};
      if (options.arrays || options.defaults) object.fragment = [];
      if (options.defaults) object.siteId = 0;
      if (message.siteId != null && message.hasOwnProperty("siteId"))
        object.siteId = message.siteId;
      if (message.fragment && message.fragment.length) {
        object.fragment = [];
        for (var j = 0; j < message.fragment.length; ++j)
          object.fragment[j] = $root.web_gis.RADAR_IMAGE.Position.toObject(
            message.fragment[j],
            options
          );
      }
      return object;
    };

    /**
     * Converts this RADAR_IMAGE to JSON.
     * @function toJSON
     * @memberof web_gis.RADAR_IMAGE
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RADAR_IMAGE.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    RADAR_IMAGE.Position = (function () {
      /**
       * Properties of a Position.
       * @memberof web_gis.RADAR_IMAGE
       * @interface IPosition
       * @property {number} amplitude Position amplitude
       * @property {number} x1 Position x1
       * @property {number} y1 Position y1
       * @property {number} x2 Position x2
       * @property {number} y2 Position y2
       * @property {number} x3 Position x3
       * @property {number} y3 Position y3
       * @property {number} x4 Position x4
       * @property {number} y4 Position y4
       */

      /**
       * Constructs a new Position.
       * @memberof web_gis.RADAR_IMAGE
       * @classdesc Represents a Position.
       * @implements IPosition
       * @constructor
       * @param {web_gis.RADAR_IMAGE.IPosition=} [properties] Properties to set
       */
      function Position(properties) {
        if (properties)
          for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
            if (properties[keys[i]] != null)
              this[keys[i]] = properties[keys[i]];
      }

      /**
       * Position amplitude.
       * @member {number} amplitude
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.amplitude = 0;

      /**
       * Position x1.
       * @member {number} x1
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.x1 = 0;

      /**
       * Position y1.
       * @member {number} y1
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.y1 = 0;

      /**
       * Position x2.
       * @member {number} x2
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.x2 = 0;

      /**
       * Position y2.
       * @member {number} y2
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.y2 = 0;

      /**
       * Position x3.
       * @member {number} x3
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.x3 = 0;

      /**
       * Position y3.
       * @member {number} y3
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.y3 = 0;

      /**
       * Position x4.
       * @member {number} x4
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.x4 = 0;

      /**
       * Position y4.
       * @member {number} y4
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       */
      Position.prototype.y4 = 0;

      /**
       * Creates a new Position instance using the specified properties.
       * @function create
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {web_gis.RADAR_IMAGE.IPosition=} [properties] Properties to set
       * @returns {web_gis.RADAR_IMAGE.Position} Position instance
       */
      Position.create = function create(properties) {
        return new Position(properties);
      };

      /**
       * Encodes the specified Position message. Does not implicitly {@link web_gis.RADAR_IMAGE.Position.verify|verify} messages.
       * @function encode
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {web_gis.RADAR_IMAGE.IPosition} message Position message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      Position.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.amplitude);
        writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.x1);
        writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.y1);
        writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.x2);
        writer.uint32(/* id 5, wireType 0 =*/ 40).int32(message.y2);
        writer.uint32(/* id 6, wireType 0 =*/ 48).int32(message.x3);
        writer.uint32(/* id 7, wireType 0 =*/ 56).int32(message.y3);
        writer.uint32(/* id 8, wireType 0 =*/ 64).int32(message.x4);
        writer.uint32(/* id 9, wireType 0 =*/ 72).int32(message.y4);
        return writer;
      };

      /**
       * Encodes the specified Position message, length delimited. Does not implicitly {@link web_gis.RADAR_IMAGE.Position.verify|verify} messages.
       * @function encodeDelimited
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {web_gis.RADAR_IMAGE.IPosition} message Position message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      Position.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a Position message from the specified reader or buffer.
       * @function decode
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {web_gis.RADAR_IMAGE.Position} Position
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      Position.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length,
          message = new $root.web_gis.RADAR_IMAGE.Position();
        while (reader.pos < end) {
          var tag = reader.uint32();
          switch (tag >>> 3) {
            case 1:
              message.amplitude = reader.int32();
              break;
            case 2:
              message.x1 = reader.int32();
              break;
            case 3:
              message.y1 = reader.int32();
              break;
            case 4:
              message.x2 = reader.int32();
              break;
            case 5:
              message.y2 = reader.int32();
              break;
            case 6:
              message.x3 = reader.int32();
              break;
            case 7:
              message.y3 = reader.int32();
              break;
            case 8:
              message.x4 = reader.int32();
              break;
            case 9:
              message.y4 = reader.int32();
              break;
            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        if (!message.hasOwnProperty("amplitude"))
          throw $util.ProtocolError("missing required 'amplitude'", {
            instance: message,
          });
        if (!message.hasOwnProperty("x1"))
          throw $util.ProtocolError("missing required 'x1'", {
            instance: message,
          });
        if (!message.hasOwnProperty("y1"))
          throw $util.ProtocolError("missing required 'y1'", {
            instance: message,
          });
        if (!message.hasOwnProperty("x2"))
          throw $util.ProtocolError("missing required 'x2'", {
            instance: message,
          });
        if (!message.hasOwnProperty("y2"))
          throw $util.ProtocolError("missing required 'y2'", {
            instance: message,
          });
        if (!message.hasOwnProperty("x3"))
          throw $util.ProtocolError("missing required 'x3'", {
            instance: message,
          });
        if (!message.hasOwnProperty("y3"))
          throw $util.ProtocolError("missing required 'y3'", {
            instance: message,
          });
        if (!message.hasOwnProperty("x4"))
          throw $util.ProtocolError("missing required 'x4'", {
            instance: message,
          });
        if (!message.hasOwnProperty("y4"))
          throw $util.ProtocolError("missing required 'y4'", {
            instance: message,
          });
        return message;
      };

      /**
       * Decodes a Position message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {web_gis.RADAR_IMAGE.Position} Position
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      Position.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Verifies a Position message.
       * @function verify
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */
      Position.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
          return "object expected";
        if (!$util.isInteger(message.amplitude))
          return "amplitude: integer expected";
        if (!$util.isInteger(message.x1)) return "x1: integer expected";
        if (!$util.isInteger(message.y1)) return "y1: integer expected";
        if (!$util.isInteger(message.x2)) return "x2: integer expected";
        if (!$util.isInteger(message.y2)) return "y2: integer expected";
        if (!$util.isInteger(message.x3)) return "x3: integer expected";
        if (!$util.isInteger(message.y3)) return "y3: integer expected";
        if (!$util.isInteger(message.x4)) return "x4: integer expected";
        if (!$util.isInteger(message.y4)) return "y4: integer expected";
        return null;
      };

      /**
       * Creates a Position message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {web_gis.RADAR_IMAGE.Position} Position
       */
      Position.fromObject = function fromObject(object) {
        if (object instanceof $root.web_gis.RADAR_IMAGE.Position) return object;
        var message = new $root.web_gis.RADAR_IMAGE.Position();
        if (object.amplitude != null) message.amplitude = object.amplitude | 0;
        if (object.x1 != null) message.x1 = object.x1 | 0;
        if (object.y1 != null) message.y1 = object.y1 | 0;
        if (object.x2 != null) message.x2 = object.x2 | 0;
        if (object.y2 != null) message.y2 = object.y2 | 0;
        if (object.x3 != null) message.x3 = object.x3 | 0;
        if (object.y3 != null) message.y3 = object.y3 | 0;
        if (object.x4 != null) message.x4 = object.x4 | 0;
        if (object.y4 != null) message.y4 = object.y4 | 0;
        return message;
      };

      /**
       * Creates a plain object from a Position message. Also converts values to other types if specified.
       * @function toObject
       * @memberof web_gis.RADAR_IMAGE.Position
       * @static
       * @param {web_gis.RADAR_IMAGE.Position} message Position
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      Position.toObject = function toObject(message, options) {
        if (!options) options = {};
        var object = {};
        if (options.defaults) {
          object.amplitude = 0;
          object.x1 = 0;
          object.y1 = 0;
          object.x2 = 0;
          object.y2 = 0;
          object.x3 = 0;
          object.y3 = 0;
          object.x4 = 0;
          object.y4 = 0;
        }
        if (message.amplitude != null && message.hasOwnProperty("amplitude"))
          object.amplitude = message.amplitude;
        if (message.x1 != null && message.hasOwnProperty("x1"))
          object.x1 = message.x1;
        if (message.y1 != null && message.hasOwnProperty("y1"))
          object.y1 = message.y1;
        if (message.x2 != null && message.hasOwnProperty("x2"))
          object.x2 = message.x2;
        if (message.y2 != null && message.hasOwnProperty("y2"))
          object.y2 = message.y2;
        if (message.x3 != null && message.hasOwnProperty("x3"))
          object.x3 = message.x3;
        if (message.y3 != null && message.hasOwnProperty("y3"))
          object.y3 = message.y3;
        if (message.x4 != null && message.hasOwnProperty("x4"))
          object.x4 = message.x4;
        if (message.y4 != null && message.hasOwnProperty("y4"))
          object.y4 = message.y4;
        return object;
      };

      /**
       * Converts this Position to JSON.
       * @function toJSON
       * @memberof web_gis.RADAR_IMAGE.Position
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      Position.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      return Position;
    })();

    return RADAR_IMAGE;
  })();

  return web_gis;
})();

var proto = $root;

var proto$1 = /*@__PURE__*/getDefaultExportFromCjs(proto);

export { proto$1 as default };
