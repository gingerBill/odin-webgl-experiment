const runWasm = async () => {
	const WORD_SIZE = 4;
	
	const assert = (condition, message) => {
		if (!condition)	 {
			throw new Error("Assertion:" + (message || ""));
		}
	};
	
	const mem = () => {
		return new DataView(memory.buffer);
	};
	
	const loadU8   = (addr) => mem().getUint8  (addr, true);
	const loadI8   = (addr) => mem().getInt8   (addr, true);
	const loadU16  = (addr) => mem().getUint16 (addr, true);
	const loadI16  = (addr) => mem().getInt16  (addr, true);
	const loadU32  = (addr) => mem().getUint32 (addr, true);
	const loadI32  = (addr) => mem().getInt32  (addr, true);
	const loadU64 = (addr) => {
		const lo = mem().getUint32(addr + 0, true);
		const hi = mem().getUint32(addr + 4, true);
		return lo + hi*4294967296;
	};
	const loadI64 = (addr) => {
		// TODO(bill): loadI64 correctly
		const lo = mem().getUint32(addr + 0, true);
		const hi = mem().getUint32(addr + 4, true);
		return lo + hi*4294967296;
	};
	const loadF32  = (addr) => mem().getFloat32(addr, true);
	const loadF64  = (addr) => mem().getFloat64(addr, true);
	const loadInt  = (addr) => mem().getInt32  (addr, true);
	const loadUint = (addr) => mem().getUint32 (addr, true);
	
	const storeU8   = (addr, value) => mem().setUint8  (addr, value, true);
	const storeI8   = (addr, value) => mem().setInt8   (addr, value, true);
	const storeU16  = (addr, value) => mem().setUint16 (addr, value, true);
	const storeI16  = (addr, value) => mem().setInt16  (addr, value, true);
	const storeU32  = (addr, value) => mem().setUint32 (addr, value, true);
	const storeI32  = (addr, value) => mem().setInt32  (addr, value, true);
	const storeU64 = (addr, value) => {
		mem().setUint32(addr + 0, value, true);
		mem().setUint32(addr + 4, Math.floor(value / 4294967296), true);
	};
	const storeI64 = (addr, value) => {
		// TODO(bill): storeI64 correctly
		mem().setUint32(addr + 0, value, true);
		mem().setUint32(addr + 4, Math.floor(value / 4294967296), true);
	};
	const storeF32  = (addr, value) => mem().setFloat32(addr, value, true);
	const storeF64  = (addr, value) => mem().setFloat64(addr, value, true);
	const storeInt  = (addr, value) => mem().setInt32  (addr, value, true);
	const storeUint = (addr, value) => mem().setUint32 (addr, value, true);
	
	const loadPtr = (addr) => loadUint(addr);
	
	const loadBytes = (ptr, len) => {
		return new Uint8Array(memory.buffer, ptr, len);
	};
	
	const loadString = (ptr, len) => {
		const bytes = loadBytes(ptr, len);
		return new TextDecoder('utf-8').decode(bytes);
	};
		
	const stripNewline = (str) => {
		if (str.endsWith("\r\n")) {
			return str.substring(0, str.length-2);
		} else if (str.endsWith("\n")) {
			return str.substring(0, str.length-1);
		}
		return str;
 	};
	
	const MAX_INFO_CONSOLE_LINES = 512;
	let infoConsoleLines = new Array();
	const addConsoleLine = (line) => {
		if (line === undefined) {
			return;
		}
		if (line.endsWith("\n")) {
			line = line.substring(0, line.length-1);
		} else if (infoConsoleLines.length > 0) {
			let prev_line = infoConsoleLines.pop();
			line = prev_line.concat(line);
		}
		infoConsoleLines.push(line);
		
		if (infoConsoleLines.length > MAX_INFO_CONSOLE_LINES) {
			infoConsoleLines.shift();
		}
		
		let data = "";
		for (let i = 0; i < infoConsoleLines.length; i++) {
			if (i != 0) {
				data = data.concat("\n");
			}
			data = data.concat(infoConsoleLines[i]);
		}
		
		let info = document.getElementById('console');
		info.innerHTML = data;
		info.scrollTop = info.scrollHeight;
	};
	
	let GL = {
		ctx: null,
		ctx_version: 1,
		counter: 1,
		lastError: 0,
		buffers: [],
		mappedBuffers: {},
		programs: [],
		framebuffers: [],
		renderbuffers: [],
		textures: [],
		uniforms: [],
		shaders: [],
		vaos: [],
		contexts: [],
		currentContext: null,
		offscreenCanvases: {},
		timerQueriesEXT: [],
		queries: [],
		samplers: [],
		transformFeedbacks: [],
		syncs: [],
		programInfos: {},
		
		
		AssertWebGL2: () => {
			assert(GL.ctx_version == 2.0);
		},
		getNewId: (table) => {
			for (var ret = GL.counter++, i = table.length; i < ret; i++) {
				table[i] = null;
			}
			return ret;
		},
		recordError: (errorCode) => {
			GL.lastError || (GL.lastError = errorCode);
		},
		populateUniformTable: (program) => {
			let p = GL.programs[program];
			GL.programInfos[program] = {
				uniforms: {},
				maxUniformLength: 0,
				maxAttributeLength: -1,
				maxUniformBlockNameLength: -1,
			};
			for (let ptable = GL.programInfos[program], utable = ptable.uniforms, numUniforms = GL.ctx.getProgramParameter(p, GL.ctx.ACTIVE_UNIFORMS), i = 0; i < numUniforms; ++i) {
				let u = GL.ctx.getActiveUniform(p, i);
				let name = u.name;
				if (ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1), name.indexOf("]", name.length - 1) !== -1) {
					name = name.slice(0, name.lastIndexOf("["));
				}
				let loc = GL.ctx.getUniformLocation(p, name);
				if (loc !== null) {
					let id = GL.getNewId(GL.uniforms);
					utable[name] = [u.size, id], GL.uniforms[id] = loc;
					for (let j = 1; j < u.size; ++j) {
						let n = name + "[" + j + "]";
						let loc = GL.ctx.getUniformLocation(p, n);
						let id = GL.getNewId(GL.uniforms);
						GL.uniforms[id] = loc;
					}
				}
			}
		},
		getSource: (shader, strings_ptr, strings_length) => {
			const STRING_SIZE = 2*WORD_SIZE;
			let source = "";
			for (let i = 0; i < strings_length; i++) {
				let ptr = loadPtr(strings_ptr + i*STRING_SIZE);
				let len = loadPtr(strings_ptr + i*STRING_SIZE + WORD_SIZE);
				let str = loadString(ptr, len);
				source += str;
			}
			return source;
		},
	}
	
	const imports = {
		"odin_env": {
			write: (fd, ptr, len) => {
				const str = loadString(ptr, len);
				if (fd == 1) {
					addConsoleLine(str);
					return;
				} else if (fd == 2) {
					addConsoleLine(str);
					return;
				} else {
					throw new Error("Invalid fd to 'write'" + stripNewline(str));
				}
			},
			trap: () => { throw new Error() },
			alert: (ptr, len) => { alert(loadString(ptr, len)) },
			abort: () => { Module.abort() },
			evaluate: (str_ptr, str_len) => { eval.call(null, loadString(str_ptr, str_len)); },
			
			time_now: () => {
				return performance.now() * 1e6;
			},
		},
		
		"webgl_math": {
			cos:   (x) => Math.cos(x),
			sin:   (x) => Math.sin(x),
			tan:   (x) => Math.tan(x),
			acos:  (x) => Math.acos(x),
			asin:  (x) => Math.asin(x),
			atan:  (x) => Math.atan(x),
			atan2: (y, x) => Math.atan2(y, x),
			sqrt:  (x) => Math.sqrt(x),
			inversesqrt: (x) => Math.pow(x, -0.5),
			pow:   (x, y) => Math.pow(x, y),
			exp:   (x) => Math.exp(x),
			log:   (x) => Math.log(x),
			exp2:  (x) => Math.pow(2, x),
			sign:  (x) => Math.sign(x),
			floor: (x) => Math.floor(x),
			ceil:  (x) => Math.ceil(x),
			mod: (x, y) => x - y*Math.floor(x/y),
			fract: (x) => {
				if (x >= 0) {
					return x - Math.trunc(x);
				}
				x = -x;
				return -(x - Math.trunc(x));
			},
			cosh:   (x) => Math.cosh(x),
			sinh:   (x) => Math.sinh(x),
			tanh:   (x) => Math.tanh(x),
			acosh:  (x) => Math.acosh(x),
			asinh:  (x) => Math.asinh(x),
			atanh:  (x) => Math.atanh(x),
		},
		
		"webgl": {
			DrawingBufferWidth:  () => GL.ctx.drawingBufferWidth,
			DrawingBufferHeight: () => GL.ctx.drawingBufferHeight,
			
			IsExtensionSupported: (name_ptr, name_len) => {
				let name = loadString(name_ptr, name_len);
				let extensions = GL.ctx.getSupportedExtensions();
				return extensions.indexOf(name) !== -1
			},
			
			
			GetError: () => {
				let err = GL.lastError;
				GL.recordError(0);
				if (err) {
					return err;
				}
				return GL.ctx.getError();
			},
			
			GetWebGLVersion: (major_ptr, minor_ptr) => {
				let version = GL.ctx.getParameter(0x1F02);
				if (version.indexOf("WebGL 2.0") !== -1) {
					storeI32(major_ptr, 2);
					storeI32(minor_ptr, 0);
					return;
				}
				
				storeI32(major_ptr, 1);
				storeI32(minor_ptr, 0);
			},
			GetESVersion: (major_ptr, minor_ptr) => {
				let version = GL.ctx.getParameter(0x1F02);
				if (version.indexOf("OpenGL ES 3.0") !== -1) {
					storeI32(major_ptr, 3);
					storeI32(minor_ptr, 0);
					return;
				}
				
				storeI32(major_ptr, 2);
				storeI32(minor_ptr, 0);
			},
			
			
			ActiveTexture: (x) => {
				GL.ctx.activeTexture(x);
			},
			AttachShader: (program, shader) => {
				GL.ctx.attachShader(GL.programs[program], GL.shaders[shader]);
			},
			BindAttribLocation: (program, index, name_ptr, name_len) => {
				let name = loadString(name_ptr, name_len);
				GL.ctx.bindAttribLocation(GL.programs[program], index, name)
			},
			BindBuffer: (target, buffer) => {
				let bufferObj = buffer ? GL.buffers[buffer] : null;
				if (target == 35051) {
					GL.ctx.currentPixelPackBufferBinding = buffer;
				} else {
					if (target == 35052) {
						GL.ctx.currentPixelUnpackBufferBinding = buffer;
					}
					GL.ctx.bindBuffer(target, bufferObj)
				}
			},
			BindFramebuffer: (target, buffer) => {
				// TODO: BindFramebuffer
			},
			BindTexture: (target, texture) => {
				GL.ctx.bindTexture(target, texture ? GL.textures[texture] : null)
			},
			BlendColor: (red, green, blue, alpha) => {
				GL.ctx.blendColor(red, green, blue, alpha);
			},
			BlendEquation: (mode) => {
				GL.ctx.blendEquation(mode);
			},
			BlendFunc: (sfactor, dfactor) => {
				GL.ctx.blendFunc(sfactor, dfactor);
			},
			BlendFuncSeparate: (srcRGB, dstRGB, srcAlpha, dstAlpha) => {
				GL.ctx.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
			},
			
			
			BufferData: (target, size, data, usage) => {
				if (data) {
					GL.ctx.bufferData(target, loadBytes(data, size), usage);
				} else {
					GL.ctx.bufferData(target, size, usage);
				}
			},
			BufferSubData: (target, offset, size, data) => {
				if (data) {
					GL.ctx.bufferSubData(target, offset, loadBytes(data, size));
				} else {
					GL.ctx.bufferSubData(target, offset, null);
				}
			},
			
			
			Clear: (x) => {
				GL.ctx.clear(x);
			},
			ClearColor: (r, g, b, a) => {
				GL.ctx.clearColor(r, g, b, a);
			},
			ClearDepth: (x) => {
				GL.ctx.clearDepth(x);
			},
			ClearStencil: (x) => {
				GL.ctx.clearStencil(x);
			},
			ColorMask: (r, g, b, a) => {
				GL.ctx.colorMask(!!r, !!g, !!b, !!a);
			},
			CompileShader: (shader) => {
				GL.ctx.compileShader(GL.shaders[shader]);
			},
			
			
			CompressedTexImage2D: (target, level, internalformat, width, height, border, imageSize, data) => {
				if (data) {
					GL.ctx.compressedTexImage2D(target, level, internalformat, width, height, border, loadBytes(data, imageSize));
				} else {
					GL.ctx.compressedTexImage2D(target, level, internalformat, width, height, border, null);
				}
			},
			CompressedTexSubImage2D: (target, level, xoffset, yoffset, width, height, format, imageSize, data) => {
				if (data) {
					GL.ctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, loadBytes(data, imageSize));
				} else {
					GL.ctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, null);
				}
			},
			
			CopyTexImage2D: (target, level, internalformat, x, y, width, height, border) => {
				GL.ctx.copyTexImage2D(target, level, internalformat, x, y, width, height, border);
			},
			CopyTexSubImage2D: (target, level, xoffset, yoffset, x, y, width, height) => {
				GL.ctx.copyTexImage2D(target, level, xoffset, yoffset, x, y, width, height);
			},
			
			
			CreateBuffer: () => {
				let buffer = GL.ctx.createBuffer();
				if (!buffer) {
					GL.recordError(1282);
					return 0;
				}
				let id = GL.getNewId(GL.buffers);
				buffer.name = id
				GL.buffers[id] = buffer;
				return id;
			},
			CreateFramebuffer: () => {
				let buffer = GL.ctx.createFramebuffer();
				let id = GL.getNewId(GL.framebuffers);
				buffer.name = id
				GL.framebuffers[id] = buffer;
				return id;
			},
			CreateProgram: () => {
				let program = GL.ctx.createProgram();
				let id = GL.getNewId(GL.programs);
				program.name = id;
				GL.programs[id] = program;
				return id;
			},
			CreateRenderbuffer: () => {
				let buffer = GL.ctx.createRenderbuffer();
				let id = GL.getNewId(GL.renderbuffers);
				buffer.name = id;
				GL.renderbuffers[id] = buffer;
				return id;
			},
			CreateShader: (shaderType) => {
				let shader = GL.ctx.createShader(shaderType);
				let id = GL.getNewId(GL.shaders);
				shader.name = id;
				GL.shaders[id] = shader;
				return id;
			},
			CreateTexture: () => {
				let texture = GL.ctx.createTexture();
				if (!texture) {
					GL.recordError(1282)
					return 0;
				}
				let id = GL.getNewId(GL.textures);
				texture.name = id;
				GL.textures[id] = texture;
				return id;
			},
			
			
			CullFace: (mode) => {
				GL.ctx.cullFace(mode);
			},
			
			
			DeleteBuffer: (id) => {
				let obj = GL.buffers[id];
				if (obj && id != 0) {
					GL.ctx.deleteBuffer(obj);
					GL.buffers[id] = null;
				}
			},
			DeleteFramebuffer: (id) => {
				let obj = GL.framebuffers[id];
				if (obj && id != 0) {
					GL.ctx.deleteFramebuffer(obj);
					GL.framebuffers[id] = null;
				}
			},
			DeleteProgram: (id) => {
				let obj = GL.programs[id];
				if (obj && id != 0) {
					GL.ctx.deleteProgram(obj);
					GL.programs[id] = null;
				}
			},
			DeleteRenderbuffer: (id) => {
				let obj = GL.renderbuffers[id];
				if (obj && id != 0) {
					GL.ctx.deleteRenderbuffer(obj);
					GL.renderbuffers[id] = null;
				}
			},
			DeleteShader: (id) => {
				let obj = GL.shaders[id];
				if (obj && id != 0) {
					GL.ctx.deleteShader(obj);
					GL.shaders[id] = null;
				}
			},
			DeleteTexture: (id) => {
				let obj = GL.textures[id];
				if (obj && id != 0) {
					GL.ctx.deleteTexture(obj);
					GL.textures[id] = null;
				}
			},


			DepthFunc: (func) => {
				GL.ctx.depthFunc(func);
			},
			DepthMask: (flag) => {
				GL.ctx.depthMask(!!flag);
			},
			DepthRange: (zNear, zFar) => {
				GL.ctx.depthRange(zNear, zFar);
			},
			DetachShader: (program, shader) => {
				GL.ctx.detachShader(GL.programs[program], GL.shaders[shader]);
			},
			Disable: (cap) => {
				GL.ctx.disable(cap);
			},
			DisableVertexAttribArray: (index) => {
				GL.ctx.disableVertexAttribArray(index);
			},
			DrawArrays: (mode, first, count) => {
				GL.ctx.drawArrays(mode, first, count);
			},
			DrawElements: (mode, count, type, indices) => {
				GL.ctx.drawElements(mode, count, type, indices);
			},
			
			
			Enable: (cap) => {
				GL.ctx.enable(cap);
			},
			EnableVertexAttribArray: (index) => {
				GL.ctx.enableVertexAttribArray(index);
			},
			Finish: () => {
				GL.ctx.finish();
			},
			Flush: () => {
				GL.ctx.flush();
			},
			FramebufferRenderBuffer: (target, attachment, renderbuffertarget, renderbuffer) => {
				GL.ctx.framebufferRenderBuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
			},
			FramebufferTexture2D: (target, attachment, textarget, texture, level) => {
				GL.ctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
			},
			FrontFace: (mode) => {
				GL.ctx.frontFace(mode);
			},
			
				
			GenerateMipmap: (target) => {
				GL.ctx.generateMipmap(target);
			},
			
			
			GetAttribLocation: (program, name_ptr, name_len) => {
				let name = loadString(name_ptr, name_len);
				return GL.ctx.getAttribLocation(GL.programs[program], name);
			},
			
			
			
			GetProgramParameter: (program, pname) => {
				return GL.ctx.getProgramParameter(GL.programs[program], pname)
			},
			GetProgramInfoLog: (program, buf_ptr, buf_len, length_ptr) => {
				let log = GL.ctx.getProgramInfoLog(GL.programs[program]);
				if (log === null) {
					log = "(unknown error)";
				}
				if (buf_len > 0 && buf_ptr) {
					let n = Math.min(buf_len, log.length);
					log = log.substring(0, n);
					loadBytes(buf_ptr, buf_len).set(new TextEncoder('utf-8').encode(log))
					
					storeInt(length_ptr, n);
				}
			},
			GetShaderInfoLog: (shader, buf_ptr, buf_len, length_ptr) => {
				let log = GL.ctx.getShaderInfoLog(GL.shaders[shader]);
				if (log === null) {
					log = "(unknown error)";
				}
				if (buf_len > 0 && buf_ptr) {
					let n = Math.min(buf_len, log.length);
					log = log.substring(0, n);
					loadBytes(buf_ptr, buf_len).set(new TextEncoder('utf-8').encode(log))
					
					storeInt(length_ptr, n);
				}
			},
			GetShaderiv: (shader, pname, p) => {
				if (p) {
					if (pname == 35716) {
						let log = GL.ctx.getShaderInfoLog(GL.shaders[shader]);
						if (log === null) {
							log = "(unknown error)";
						}
						storeInt(p, log.length+1);
					} else if (pname == 35720) {
						let source = GL.ctx.getShaderSource(GL.shaders[shader]);
						let sourceLength = (source === null || source.length == 0) ? 0 : source.length+1;
						storeInt(p, sourceLength);
					} else {
						let param = GL.ctx.getShaderParameter(GL.shaders[shader], pname);
						storeI32(p, param);
					}
				} else {
					GL.recordError(1281);
				}
			},
			
			
			GetUniformLocation: (program, name_ptr, name_len) => {
				let name = loadString(name_ptr, name_len);
				let arrayOffset = 0;
				if (name.indexOf("]", name.length - 1) !== -1) {
					let ls = name.lastIndexOf("["),
					arrayIndex = name.slice(ls + 1, -1);
					if (arrayIndex.length > 0 && (arrayOffset = parseInt(arrayIndex)) < 0) {
						return -1;
					}
					name = name.slice(0, ls)
				}
				var ptable = GL.programInfos[program];
				if (!ptable) {
					return -1;
				}
				var uniformInfo = ptable.uniforms[name];
				return (uniformInfo && arrayOffset < uniformInfo[0]) ? uniformInfo[1] + arrayOffset : -1
			},
			
			
			GetVertexAttribOffset: (index, pname) => {
				return GL.ctx.getVertexAttribOffset(index, pname);
			},
			
			
			Hint: (target, mode) => {
				GL.ctx.hint(target, mode);
			},
			
			
			IsBuffer:       (buffer)       => GL.ctx.isBuffer(GL.buffers[buffer]),
			IsEnabled:      (enabled)      => GL.ctx.isEnabled(GL.enableds[enabled]),
			IsFramebuffer:  (framebuffer)  => GL.ctx.isFramebuffer(GL.framebuffers[framebuffer]),
			IsProgram:      (program)      => GL.ctx.isProgram(GL.programs[program]),
			IsRenderbuffer: (renderbuffer) => GL.ctx.isRenderbuffer(GL.renderbuffers[renderbuffer]),
			IsShader:       (shader)       => GL.ctx.isShader(GL.shaders[shader]),
			IsTexture:      (texture)      => GL.ctx.isTexture(GL.textures[texture]),
			
			LineWidth: (width) => {
				GL.ctx.lineWidth(width);
			},
			LinkProgram: (program) => {
				GL.ctx.linkProgram(GL.programs[program]);
				GL.programInfos[program] = null;
				GL.populateUniformTable(program);
			},
			PixelStorei: (pname, param) => {
				GL.ctx.pixelStorei(pname, param);
			},
			PolygonOffset: (factor, units) => {
				GL.ctx.polygonOffset(factor, units);
			},
			
			
			ReadnPixels: (x, y, width, height, format, type, bufSize, data) => {
				GL.ctx.readPixels(x, y, width, format, type, loadBytes(data, bufSize));
			},
			RenderbufferStorage: (target, internalformat, width, height) => {
				GL.ctx.renderbufferStorage(target, internalformat, width, height);
			},
			SampleCoverage: (value, invert) => {
				GL.ctx.sampleCoverage(value, !!invert);
			},
			Scissor: (x, y, width, height) => {
				GL.ctx.scissor(x, y, width, height);
			},
			ShaderSource: (shader, strings_ptr, strings_length) => {
				let source = GL.getSource(shader, strings_ptr, strings_length);
				GL.ctx.shaderSource(GL.shaders[shader], source);
			},
			
			StencilFunc: (func, ref, mask) => {
				GL.ctx.stencilFunc(func, ref, mask);
			},
			StencilFuncSeparate: (face, func, ref, mask) => {
				GL.ctx.stencilFuncSeparate(face, func, ref, mask);
			},
			StencilMask: (mask) => {
				GL.ctx.stencilMask(mask);
			},
			StencilMaskSeparate: (face, mask) => {
				GL.ctx.stencilMaskSeparate(face, mask);
			},
			StencilOp: (fail, zfail, zpass) => {
				GL.ctx.stencilOp(fail, zfail, zpass);
			},
			StencilOpSeparate: (face, fail, zfail, zpass) => {
				GL.ctx.stencilOpSeparate(face, fail, zfail, zpass);
			},
			
			
			TexImage2D: (target, level, internalformat, width, height, border, format, type, size, data) => {
				if (data) {
					GL.ctx.texImage2D(target, level, internalformat, width, height, border, format, type, loadBytes(data, size));
				} else {
					GL.ctx.texImage2D(target, level, internalformat, width, height, border, format, type, null);
				}
			},
			TexParameterf: (target, pname, param) => {
				GL.ctx.texParameterf(target, pname, param);
			},
			TexParameteri: (target, pname, param) => {
				GL.ctx.texParameteri(target, pname, param);
			},
			TexSubImage2D: (target, level, xoffset, yoffset, width, height, format, type, size, data) => {
				GL.ctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, loadBytes(data, size));
			},
			
			
			Uniform1f: (location, v0)             => { GL.ctx.uniform1f(GL.uniforms[location], v0);             },
			Uniform2f: (location, v0, v1)         => { GL.ctx.uniform2f(GL.uniforms[location], v0, v1);         },
			Uniform3f: (location, v0, v1, v2)     => { GL.ctx.uniform3f(GL.uniforms[location], v0, v1, v2);     },
			Uniform4f: (location, v0, v1, v2, v3) => { GL.ctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3); },
			
			Uniform1i: (location, v0)             => { GL.ctx.uniform1i(GL.uniforms[location], v0);             },
			Uniform2i: (location, v0, v1)         => { GL.ctx.uniform2i(GL.uniforms[location], v0, v1);         },
			Uniform3i: (location, v0, v1, v2)     => { GL.ctx.uniform3i(GL.uniforms[location], v0, v1, v2);     },
			Uniform4i: (location, v0, v1, v2, v3) => { GL.ctx.uniform4i(GL.uniforms[location], v0, v1, v2, v3); },
			
			UniformMatrix2fv: (location, addr) => {
				let array = new Float32Array(memory.buffer, addr, 2*2);
				GL.ctx.uniformMatrix4fv(GL.uniforms[location], false, array);
			},
			UniformMatrix3fv: (location, addr) => {
				let array = new Float32Array(memory.buffer, addr, 3*3);
				GL.ctx.uniformMatrix4fv(GL.uniforms[location], false, array);
			},
			UniformMatrix4fv: (location, addr) => {
				let array = new Float32Array(memory.buffer, addr, 4*4);
				GL.ctx.uniformMatrix4fv(GL.uniforms[location], false, array);
			},
			
			UseProgram: (program) => {
				GL.ctx.useProgram(GL.programs[program]);
			},
			ValidateProgram: (program) => {
				GL.ctx.validateProgram(GL.programs[program]);
			},
			
			
			VertexAttrib1f: (index, x) => {
				GL.ctx.vertexAttrib1f(index, x);
			},
			VertexAttrib2f: (index, x, y) => {
				GL.ctx.vertexAttrib2f(index, x, y);
			},
			VertexAttrib3f: (index, x, y, z) => {
				GL.ctx.vertexAttrib3f(index, x, y, z);
			},
			VertexAttrib4f: (index, x, y, z, w) => {
				GL.ctx.vertexAttrib4f(index, x, y, z, w);
			},
			VertexAttribPointer: (index, size, type, normalized, stride, ptr) => {
				GL.ctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
			},
			
			Viewport: (x, y, w, h) => {
				GL.ctx.viewport(x, y, w, h);
			},
		},
		
		"webgl2": {
			/* Buffer objects */
			CopyBufferSubData: (readTarget, writeTarget, readOffset, writeOffset, size) => {
				GL.AssertWebGL2();
				GL.ctx.copyBufferSubData(readTarget, writeTarget, readOffset, writeOffset, size);
			},
			GetBufferSubData: (target, srcByteOffset, dst_buffer_ptr, dst_buffer_len, dstOffset, length) => {
				GL.AssertWebGL2();
				GL.ctx.getBufferSubData(target, srcByteOffset, loadBytes(dst_buffer_ptr, dst_buffer_len), dstOffset, length);
			},
			
			/* Framebuffer objects */
			BlitFramebuffer: (srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, mask, filter) => {
				GL.AssertWebGL2();
				GL.ctx.glitFramebuffer(srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, mask, filter);
			},
			FramebufferTextureLayer: (target, attachment, texture, level, layer) => {
				GL.AssertWebGL2();
				GL.ctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer);
			},
			InvalidateFramebuffer: (target, attachments_ptr, attachments_len) => {
				GL.AssertWebGL2();
				let attachments = new Uint32Array(memory.buffer, attachments_ptr, attachments_len);
				GL.ctx.invalidateFramebuffer(target, attachments);
			},
			InvalidateSubFramebuffer: (target, attachments_ptr, attachments_len, x, y, width, height) => {	
				GL.AssertWebGL2();
				let attachments = new Uint32Array(memory.buffer, attachments_ptr, attachments_len);
				GL.ctx.invalidateSubFramebuffer(target, attachments, x, y, width, height);
			},
			ReadBuffer: (src) => {
				GL.AssertWebGL2();
				GL.ctx.readBuffer(src);
			},
			
			/* Renderbuffer objects */
			RenderbufferStorageMultisample: (target, samples, internalformat, width, height) => {
				GL.AssertWebGL2();
				GL.ctx.renderbufferStorageMultisample(target, samples, internalformat, width, height);
			},
			
			/* Texture objects */
			
			TexStorage3D: (target, levels, internalformat, width, height, depth) => {
				GL.AssertWebGL2();
				GL.ctx.texStorage3D(target, level, internalformat, width, heigh, depth);
			},
			TexImage3D: (target, level, internalformat, width, height, depth, border, format, type, size, data) => {
				GL.AssertWebGL2();
				if (data) {
					GL.ctx.texImage3D(target, level, internalformat, width, height, depth, border, format, type, loadBytes(data, size));
				} else {
					GL.ctx.texImage3D(target, level, internalformat, width, height, depth, border, format, type, null);
				}
			},
			TexSubImage3D: (target, level, xoffset, yoffset, width, height, depth, format, type, size, data) => {
				GL.AssertWebGL2();
				GL.ctx.texSubImage3D(target, level, xoffset, yoffset, width, height, depth, format, type, loadBytes(data, size));
			},
			CompressedTexImage3D: (target, level, internalformat, width, height, depth, border, imageSize, data) => {
				GL.AssertWebGL2();
				if (data) {
					GL.ctx.compressedTexImage3D(target, level, internalformat, width, height, depth, border, loadBytes(data, imageSize));
				} else {
					GL.ctx.compressedTexImage3D(target, level, internalformat, width, height, depth, border, null);
				}
			},
			CompressedTexSubImage3D: (target, level, xoffset, yoffset, width, height, depth, format, imageSize, data) => {
				GL.AssertWebGL2();
				if (data) {
					GL.ctx.compressedTexSubImage3D(target, level, xoffset, yoffset, width, height, depth, format, loadBytes(data, imageSize));
				} else {
					GL.ctx.compressedTexSubImage3D(target, level, xoffset, yoffset, width, height, depth, format, null);
				}
			},
			
			CopyTexSubImage3D: (target, level, xoffset, yoffset, zoffset, x, y, width, height) => {
				GL.AssertWebGL2();
				GL.ctx.copyTexImage3D(target, level, xoffset, yoffset, zoffset, x, y, width, height);
			},
			
			/* Programs and shaders */
			GetFragDataLocation: (program, name_ptr, name_len) => {
				GL.AssertWebGL2();
				return GL.ctx.getFragDataLocation(GL.programs[program], loadString(name_ptr, name_len));
			},
			
			/* Uniforms */
			Uniform1ui: (location, v0) => {
				GL.AssertWebGL2();
				GL.ctx.uniform1ui(GL.uniforms[location], v0);
			},
			Uniform2ui: (location, v0, v1) => {
				GL.AssertWebGL2();
				GL.ctx.uniform2ui(GL.uniforms[location], v0, v1);
			},
			Uniform3ui: (location, v0, v1, v2) => {
				GL.AssertWebGL2();
				GL.ctx.uniform3ui(GL.uniforms[location], v0, v1, v2);
			},
			Uniform4ui: (location, v0, v1, v2, v3) => {
				GL.AssertWebGL2();
				GL.ctx.uniform4ui(GL.uniforms[location], v0, v1, v2, v3);
			},
			
			UniformMatrix3x2fv: (location, addr) => {
				GL.AssertWebGL2();
				let array = new Float32Array(memory.buffer, addr, 3*2);
				GL.ctx.uniformMatrix3x2fv(GL.uniforms[location], false, array);
			},
			UniformMatrix4x2fv: (location, addr) => {
				GL.AssertWebGL2();
				let array = new Float32Array(memory.buffer, addr, 4*2);
				GL.ctx.uniformMatrix4x2fv(GL.uniforms[location], false, array);
			},
			UniformMatrix2x3fv: (location, addr) => {
				GL.AssertWebGL2();
				let array = new Float32Array(memory.buffer, addr, 2*3);
				GL.ctx.uniformMatrix2x3fv(GL.uniforms[location], false, array);
			},
			UniformMatrix4x3fv: (location, addr) => {
				GL.AssertWebGL2();
				let array = new Float32Array(memory.buffer, addr, 4*3);
				GL.ctx.uniformMatrix4x3fv(GL.uniforms[location], false, array);
			},
			UniformMatrix2x4fv: (location, addr) => {
				GL.AssertWebGL2();
				let array = new Float32Array(memory.buffer, addr, 2*4);
				GL.ctx.uniformMatrix2x4fv(GL.uniforms[location], false, array);
			},
			UniformMatrix3x4fv: (location, addr) => {
				GL.AssertWebGL2();
				let array = new Float32Array(memory.buffer, addr, 3*4);
				GL.ctx.uniformMatrix3x4fv(GL.uniforms[location], false, array);
			},
			
			/* Vertex attribs */
			VertexAttribI4i: (index, x, y, z, w) => {
				GL.AssertWebGL2();
				GL.ctx.vertexAttribI4i(index, x, y, z, w);
			}, 
			VertexAttribI4ui: (index, x, y, z, w) => {
				GL.AssertWebGL2();
				GL.ctx.vertexAttribI4ui(index, x, y, z, w);
			}, 
			VertexAttribIPointer: (index, size, type, stride, offset) => {
				GL.AssertWebGL2();
				GL.ctx.vertexAttribIPointer(index, size, type, stride, offset);
			}, 
			
			/* Writing to the drawing buffer */
			VertexAttribDivisor: (index, divisor) => {
				GL.AssertWebGL2();
				GL.ctx.vertexAttribDivisor(index, divisor);
			},
			DrawArraysInstanced: (mode, first, count, instanceCount) => {
				GL.AssertWebGL2();
				GL.ctx.drawArraysInstanced(mode, first, count, instanceCount);
			},
			DrawElementsInstanced: (mode, count, type, offset, instanceCount) => {
				GL.AssertWebGL2();
				GL.ctx.drawElementsInstanced(mode, count, type, offset, instanceCount);
			},
			DrawRangeElements: (mode, start, end, count, type, offset) => {
				GL.AssertWebGL2();
				GL.ctx.drawRangeElements(mode, start, end, count, type, offset);
			},

			/* Multiple Render Targets */
			DrawBuffers: (buffers_ptr, buffers_len) => {
				GL.AssertWebGL2();
				let array = new Uint32Array(memory.buffer, buffers_ptr, buffers_len);
				GL.ctx.drawBuffers(array);
			},
			ClearBufferfv: (buffer, drawbuffer, values_ptr, values_len) => {
				GL.AssertWebGL2();
				let array = new Float32Array(memory.buffer, values_ptr, values_len);
				GL.ctx.clearBufferfv(buffer, drawbuffer, array);
			},
			ClearBufferiv: (buffer, drawbuffer, values_ptr, values_len) => {
				GL.AssertWebGL2();
				let array = new Int32Array(memory.buffer, values_ptr, values_len);
				GL.ctx.clearBufferiv(buffer, drawbuffer, array);
			},
			ClearBufferuiv: (buffer, drawbuffer, values_ptr, values_len) => {
				GL.AssertWebGL2();
				let array = new Uint32Array(memory.buffer, values_ptr, values_len);
				GL.ctx.clearBufferuiv(buffer, drawbuffer, array);
			},
			ClearBufferfi: (buffer, drawbuffer, depth, stencil) => {
				GL.AssertWebGL2();
				GL.ctx.clearBufferfi(buffer, drawbuffer, depth, stencil);
			},

			/* Query Objects */
			CreateQuery: () => {
				GL.AssertWebGL2();
				let query = GL.ctx.createQuery();
				let id = GL.getNewId(GL.queries);
				query.name = id;
				GL.queries[id] = query;
				return id;	
			},
			DeleteQuery: (id) => {
				GL.AssertWebGL2();
				let obj = GL.querys[id];
				if (obj && id != 0) {
					GL.ctx.deleteQuery(obj);
					GL.querys[id] = null;
				}
			},
			IsQuery: (query) => {
				GL.AssertWebGL2();	
				return GL.ctx.isQuery(GL.queries[query]);
			},
			BeginQuery: (target, query) => {
				GL.AssertWebGL2();
				GL.ctx.beginQuery(target, GL.queries[query])
			},
			EndQuery: (target) => {
				GL.AssertWebGL2();
				GL.ctx.endQuery(target);
			},
			GetQuery: (target, pname) => {
				GL.AssertWebGL2();
				let query = GL.ctx.getQuery(target, pname);
				if (!query) {
					return 0;
				}
				if (GL.queries.indexOf(query) !== -1) {
					return query.name;
				}
				let id = GL.getNewId(GL.queries);
				query.name = id;
				GL.queries[id] = query;
				return id;	
			},
			
			/* Sampler Objects */
			CreateSampler: () => {
				GL.AssertWebGL2();
				let sampler = GL.ctx.createSampler();
				let id = GL.getNewId(GL.samplers);
				sampler.name = id;
				GL.samplers[id] = sampler;
				return id;	
			},
			DeleteSampler: (id) => {
				GL.AssertWebGL2();
				let obj = GL.samplers[id];
				if (obj && id != 0) {
					GL.ctx.deleteSampler(obj);
					GL.samplers[id] = null;
				}
			},
			IsSampler: (sampler) => {
				GL.AssertWebGL2();	
				return GL.ctx.isSampler(GL.samplers[sampler]);
			},
			BindSampler: (unit, sampler) => {
				GL.AssertWebGL2();	
				GL.ctx.bindSampler(unit, GL.samplers[Sampler]);
			},
			SamplerParameteri: (sampler, pname, param) => {
				GL.AssertWebGL2();
				GL.ctx.samplerParameteri(GL.samplers[sampler], pname, param);
			},
			SamplerParameterf: (sampler, pname, param) => {
				GL.AssertWebGL2();
				GL.ctx.samplerParameterf(GL.samplers[sampler], pname, param);
			},
			
			/* Sync objects */
			FenceSync: (condition, flags) => {
				GL.AssertWebGL2();
				let sync = GL.ctx.fenceSync(condition, flags);
				let id = GL.getNewId(GL.syncs);
				sync.name = id;
				GL.syncs[id] = sync;
				return id;	
			},
			IsSync: (sync) => {
				GL.AssertWebGL2();	
				return GL.ctx.isSync(GL.syncs[sync]);
			},
			DeleteSync: (id) => {
				GL.AssertWebGL2();
				let obj = GL.syncs[id];
				if (obj && id != 0) {
					GL.ctx.deleteSampler(obj);
					GL.syncs[id] = null;
				}	
			},
			ClientWaitSync: (sync, flags, timeout) => {
				GL.AssertWebGL2();
				return GL.ctx.clientWaitSync(GL.syncs[sync], flags, timeout);
			},
			WaitSync: (sync, flags, timeout) => {
				GL.AssertWebGL2();
				GL.ctx.waitSync(GL.syncs[sync], flags, timeout)	;
			},
			
			
			/* Transform Feedback */
			CreateTransformFeedback: () => {
				GL.AssertWebGL2();
				let transformFeedback = GL.ctx.createtransformFeedback();
				let id = GL.getNewId(GL.transformFeedbacks);
				transformFeedback.name = id;
				GL.transformFeedbacks[id] = transformFeedback;
				return id;	
			},
			DeleteTransformFeedback: (id)  => {
				GL.AssertWebGL2();
				let obj = GL.transformFeedbacks[id];
				if (obj && id != 0) {
					GL.ctx.deleteTransformFeedback(obj);
					GL.transformFeedbacks[id] = null;
				}	
			},
			IsTransformFeedback: (tf) => {
				GL.AssertWebGL2();
				return GL.ctx.isTransformFeedback(GL.transformFeedbacks[tf]);
			},
			BindTransformFeedback: (target, tf) => {
				GL.AssertWebGL2();
				GL.ctx.bindTransformFeedback(target, GL.transformFeedbacks[tf]);
			},
			BeginTransformFeedback: (primitiveMode) => {
				GL.AssertWebGL2();
				GL.ctx.beginTransformFeedback(primitiveMode);
			},
			EndTransformFeedback: () => {
				GL.AssertWebGL2();
				GL.ctx.endTransformFeedback();
			},
			TransformFeedbackVaryings: (program, varyings_ptr, varyings_len, bufferMode) => {
				GL.AssertWebGL2();
				let varyings = [];
				for (let i = 0; i < varyings_len; i++) {
					let ptr = loadPtr(varyings_ptr + i*STRING_SIZE + 0*WORD_SIZE);
					let len = loadPtr(varyings_ptr + i*STRING_SIZE + 1*WORD_SIZE);
					varyings.push(loadString(ptr, len));
				}
				GL.ctx.transformFeedbackVaryings(GL.programs[program], varyings, bufferMode);
			},
			PauseTransformFeedback: () => {
				GL.AssertWebGL2();
				GL.ctx.pauseTransformFeedback();
			},
			ResumeTransformFeedback: () => {
				GL.AssertWebGL2();
				GL.ctx.resumeTransformFeedback();
			},
			
			
			/* Uniform Buffer Objects and Transform Feedback Buffers */
			BindBufferBase: (target, index, buffer) => {
				GL.AssertWebGL2();
				GL.ctx.bindBufferBase(target, index, GL.buffers[buffer]);
			},
			BindBufferRange: (target, index, buffer, offset, size) => {
				GL.AssertWebGL2();
				GL.ctx.bindBufferRange(target, index, GL.buffers[buffer], offset, size);
			},
			GetUniformBlockIndex: (program, uniformBlockName_ptr, uniformBlockName_len) => {
				GL.AssertWebGL2();
				return GL.ctx.getUniformBlockIndex(GL.programs[program], loadString(uniformBlockName_ptr, uniformBlockName_len));
			},
			// any getActiveUniformBlockParameter(WebGLProgram program, GLuint uniformBlockIndex, GLenum pname);
			GetActiveUniformBlockName: (program, uniformBlockIndex, buf_ptr, buf_len, length_ptr) => {
				GL.AssertWebGL2();
				let name = GL.ctx.getActiveUniformBlockName(GL.programs[program], uniformBlockIndex);
				
				let n = Math.min(buf_len, name.length);
				name = name.substring(0, n);
				loadBytes(buf_ptr, buf_len).set(new TextEncoder('utf-8').encode(name))
				storeInt(length_ptr, n);
			},
			UniformBlockBinding: (program, uniformBlockIndex, uniformBlockBinding) => {
				GL.AssertWebGL2();
				GL.ctx.uniformBlockBinding(GL.programs[program], uniformBlockIndex, uniformBlockBinding);
			},
			
			/* Vertex Array Objects */
			CreateVertexArray: () => {
				GL.AssertWebGL2();
				let vao = GL.ctx.createVertexArray();
				let id = GL.getNewId(GL.vaos);
				vao.name = id;
				GL.vaos[id] = vao;
				return id;	
			},
			DeleteVertexArray: (id) => {
				GL.AssertWebGL2();
				let obj = GL.vaos[id];
				if (obj && id != 0) {
					GL.ctx.deleteVertexArray(obj);
					GL.vaos[id] = null;
				}
			},
			IsVertexArray: (vertexArray) => {
				GL.AssertWebGL2();	
				return GL.ctx.isVertexArray(GL.vaos[vertexArray]);
			},
			BindVertexArray: (vertexArray) => {
				GL.AssertWebGL2();	
				GL.ctx.bindVertexArray(GL.vaos[vertexArray]);
			},
		},
	};
	
	let context_settings = {antialias: false};
	
	const canvasElement = document.querySelector("canvas");
	GL.ctx = canvasElement.getContext("webgl2", context_settings) || canvasElement.getContext("webgl", context_settings);
	if (!GL.ctx) {
		document.getElementById('console').innerHTML = 'WebGL is not available.';
		return;
	}
	if (GL.ctx.getParameter(0x1F02).indexOf("WebGL 2.0") !== -1) {
		GL.ctx_version = 2.0;
	} else {
		GL.ctx_version = 1.0;
	}
		
	const response = await fetch("./main.wasm");
	const file = await response.arrayBuffer();
	const wasm = await WebAssembly.instantiate(file, imports);
	const exports = wasm.instance.exports;
	const memory = exports.memory;
	
	exports._start();

	const odin_ctx = exports.default_context();
	
	let prevTimeStamp;
	const step = (currTimeStamp) => {
		if (prevTimeStamp == undefined) {
			prevTimeStamp = currTimeStamp;
		}

		const dt = (currTimeStamp - prevTimeStamp)*0.001;
		prevTimeStamp = currTimeStamp;
		exports.step(dt, odin_ctx);
		window.requestAnimationFrame(step);
	};
	
	window.requestAnimationFrame(step);
};
runWasm();