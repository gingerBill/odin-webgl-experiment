package webgl

foreign import "gl"

Buffer       :: distinct u32
Framebuffer  :: distinct u32
Program      :: distinct u32
Renderbuffer :: distinct u32
Shader       :: distinct u32
Texture      :: distinct u32

@(default_calling_convention="c")
foreign gl {
	DrawingBufferWidth  :: proc() -> i32 ---
	DrawingBufferHeight :: proc() -> i32 ---
	
	GetError :: proc() -> u32 ---
	
	IsExtensionSupported :: proc(name: string) -> bool ---

	ActiveTexture      :: proc(x: u32) ---
	AttachShader       :: proc(program: Program, shader: Shader) ---
	BindAttribLocation :: proc(program: Program, index: i32, name: string) ---
	BindBuffer         :: proc(target: u32, buffer: Buffer) ---
	BindFramebuffer    :: proc(target: u32, buffer: Buffer) ---
	BindTexture        :: proc(target: u32, texture: Texture) ---
	BlendColor         :: proc(red, green, blue, alpha: f32) ---
	BlendEquation      :: proc(mode: u32) ---
	BlendFunc          :: proc(sfactor, dfactor: u32) ---
	BlendFuncSeparate  :: proc(srcRGB, dstRGB, srcAlpha, dstAlpha: u32) ---
	
	BufferData    :: proc(target: u32, size: int, data: rawptr, usage: u32) ---
	BufferSubData :: proc(target: u32, offset: uintptr, size: int, data: rawptr) ---

	Clear         :: proc(bits: u32) ---
	ClearColor    :: proc(r, g, b, a: f32) ---
	ClearDepth    :: proc(x: u32) ---
	ClearStencil  :: proc(x: u32) ---
	ClearMask     :: proc(r, g, b, a: bool) ---
	CompileShader :: proc(shader: Shader) ---
	
	CompressedTexImage2D    :: proc(target: u32, level: i32, internalformat: u32, width, height: i32, border: i32, imageSize: int, data: rawptr) ---
	CompressedTexSubImage2D :: proc(target: u32, level: i32, xoffset, yoffset, width, height: i32, format: u32, imageSize: int, data: rawptr) ---

	CreateBuffer       :: proc() -> Buffer ---
	CreateFramebuffer  :: proc() -> Framebuffer ---
	CreateProgram      :: proc() -> Program ---
	CreateRenderbuffer :: proc() -> Renderbuffer ---
	CreateShader       :: proc(shaderType: u32) -> Shader ---
	CreateTexture      :: proc() -> Texture ---
	
	CullFace :: proc(mode: u32) ---
	
	DeleteBuffer       :: proc(buffer: Buffer) ---
	DeleteFramebuffer  :: proc(framebuffer: Framebuffer) ---
	DeleteProgram      :: proc(program: Program) ---
	DeleteRenderbuffer :: proc(renderbuffer: Renderbuffer) ---
	DeleteShader       :: proc(shader: Shader) ---
	DeleteTexture      :: proc(texture: Texture) ---
	
	DepthFunc                :: proc(func: u32) ---
	DepthMask                :: proc(flag: bool) ---
	DepthRange               :: proc(zNear, zFar: f32) ---
	DetachShader             :: proc(program: Program, shader: Shader) ---
	Disable                  :: proc(cap: u32) ---
	DisableVertexAttribArray :: proc(index: i32) ---
	DrawArrays               :: proc(mode: u32, first, count: int) ---
	DrawElements             :: proc(mode: u32, count: int, type: u32, indices: rawptr) ---
	
	Enable                  :: proc(cap: u32) ---
	EnableVertexAttribArray :: proc(index: i32) ---
	Finish                  :: proc() ---
	Flush                   :: proc() ---
	FramebufferRenderbuffer :: proc(target, attachment, renderbufertarget: u32, renderbuffer: Renderbuffer) ---
	FramebufferTexture2D    :: proc(target, attachment, textarget: u32, texture: Texture, level: i32) ---
	FrontFace               :: proc(mode: u32) ---
	
	GenerateMipmaps :: proc(target: u32) ---
	
	GetAttribLocation     :: proc(program: Program, name: string) -> i32 ---
	GetUniformLocation    :: proc(program: Program, name: string) -> i32 ---
	GetVertexAttribOffset :: proc(index: i32, pname: u32) -> uintptr ---
	GetProgramParameter   :: proc(program: Program, pname: u32) -> i32 ---

	Hint :: proc(target: u32, mode: u32) ---
	
	IsBuffer       :: proc(buffer: Buffer) -> bool ---
	IsFramebuffer  :: proc(framebuffer: Framebuffer) -> bool ---
	IsProgram      :: proc(program: Program) -> bool ---
	IsRenderbuffer :: proc(renderbuffer: Renderbuffer) -> bool ---
	IsShader       :: proc(shader: Shader) -> bool ---
	IsTexture      :: proc(texture: Texture) -> bool ---
	
	LineWidth     :: proc(width: f32) ---
	LinkProgram   :: proc(program: Program) ---
	PixelStorei   :: proc(pname: u32, param: i32) ---
	PolygonOffset :: proc(factor: f32, units: f32) ---
	
	ReadnPixels         :: proc(x, y, width, height: i32, format: u32, type: u32, bufSize: int, data: rawptr) ---
	RenderbufferStorage :: proc(target: u32, internalformat: u32, width, height: i32) ---
	SampleCoverage      :: proc(value: f32, invert: bool) ---
	Scissor             :: proc(x, y, width, height: i32) ---
	ShaderSource        :: proc(shader: Shader, strings: []string) ---
	
	StencilFunc         :: proc(func: u32, ref: i32, mask: u32) ---
	StencilFuncSeparate :: proc(face, func: u32, ref: i32, mask: u32) ---
	StencilMask         :: proc(mask: u32) ---
	StencilMaskSeparate :: proc(face: u32, mask: u32) ---
	StencilOp           :: proc(fail, zfail, zpass: u32) ---
	StencilOpSeparate   :: proc(face, fail, zfail, zpass: u32)	 ---
	
	TexImage2D    :: proc(target: u32, level: i32, internalformat: u32, width, height: i32, border: i32, format, type: u32, size: int, data: rawptr) ---
	TexSubImage2D :: proc(target: u32, level: i32, xoffset, yoffset, width, height: i32, format, type: u32, size: int, data: rawptr) ---
	
	TexParameterf :: proc(target, pname: u32, param: f32) ---
	TexParameteri :: proc(target, pname: u32, param: i32) ---
	
	Uniform1f :: proc(location: i32, v0: f32) ---
	Uniform2f :: proc(location: i32, v0, v1: f32) ---
	Uniform3f :: proc(location: i32, v0, v1, v2: f32) ---
	Uniform4f :: proc(location: i32, v0, v1, v2, v3: f32) ---
	
	Uniform1i :: proc(location: i32, v0: i32) ---
	Uniform2i :: proc(location: i32, v0, v1: i32) ---
	Uniform3i :: proc(location: i32, v0, v1, v2: i32) ---
	Uniform4i :: proc(location: i32, v0, v1, v2, v3: i32) ---
	
	UseProgram      :: proc(program: Program) ---
	ValidateProgram :: proc(program: Program) ---
		
	VertexAttrib1f      :: proc(index: i32, x: f32) ---
	VertexAttrib2f      :: proc(index: i32, x, y: f32) ---
	VertexAttrib3f      :: proc(index: i32, x, y, z: f32) ---
	VertexAttrib4f      :: proc(index: i32, x, y, z, w: f32) ---
	VertexAttribPointer :: proc(index: i32, size: int, type: u32, normalized: bool, stride: int, ptr: uintptr) ---
	
	Viewport :: proc(x, y, w, h: i32) ---
}

Uniform1fv :: proc "c" (location: i32, v: f32)   { Uniform1f(location, v) }
Uniform2fv :: proc "c" (location: i32, v: vec2)  { Uniform2f(location, v.x, v.y) }
Uniform3fv :: proc "c" (location: i32, v: vec3)  { Uniform3f(location, v.x, v.y, v.z) }
Uniform4fv :: proc "c" (location: i32, v: vec4)  { Uniform4f(location, v.x, v.y, v.z, v.w) }
Uniform1iv :: proc "c" (location: i32, v: i32)   { Uniform1i(location, v) }
Uniform2iv :: proc "c" (location: i32, v: ivec2) { Uniform2i(location, v.x, v.y) }
Uniform3iv :: proc "c" (location: i32, v: ivec3) { Uniform3i(location, v.x, v.y, v.z) }
Uniform4iv :: proc "c" (location: i32, v: ivec4) { Uniform4i(location, v.x, v.y, v.z, v.w) }

VertexAttrib1fv :: proc "c" (index: i32, v: f32)  { VertexAttrib1f(index, v) }
VertexAttrib2fv :: proc "c" (index: i32, v: vec2) { VertexAttrib2f(index, v.x, v.y) }
VertexAttrib3fv :: proc "c" (index: i32, v: vec3) { VertexAttrib3f(index, v.x, v.y, v.z) }
VertexAttrib4fv :: proc "c" (index: i32, v: vec4) { VertexAttrib4f(index, v.x, v.y, v.z, v.w) }

UniformMatrix2fv :: proc "c" (location: i32, m: mat2) {
	foreign gl {
		@(link_name="UniformMatrix2fv")
		_UniformMatrix2fv :: proc "c" (location: i32, value: [^]f32) ---
	}
	value := transmute([2*2]f32)m
	_UniformMatrix2fv(location, &value[0])
}
UniformMatrix3fv :: proc "c" (location: i32, m: mat3) {
	foreign gl {
		@(link_name="UniformMatrix3fv")
		_UniformMatrix3fv :: proc "c" (location: i32, value: [^]f32) ---
	}
	value := transmute([3*3]f32)m
	_UniformMatrix3fv(location, &value[0])
}
UniformMatrix4fv :: proc "c" (location: i32, m: mat4) {
	foreign gl {
		@(link_name="UniformMatrix4fv")
		_UniformMatrix4fv :: proc "c" (location: i32, value: [^]f32) ---
	}
	value := transmute([4*4]f32)m
	_UniformMatrix4fv(location, &value[0])
}

GetShaderiv :: proc "c" (shader: Shader, pname: u32) -> (p: i32) {
	@(default_calling_convention="c")
	foreign gl {
		@(link_name="GetShaderiv")
		_GetShaderiv :: proc "c" (shader: Shader, pname: u32, p: ^i32) ---
	}
	_GetShaderiv(shader, pname, &p)
	return
}


GetProgramInfoLog :: proc "c" (program: Program, buf: []byte) -> string {
	@(default_calling_convention="c")
	foreign gl {
		@(link_name="GetProgramInfoLog")
		_GetProgramInfoLog :: proc "c" (program: Program, buf: []byte, length: ^int) ---
	}
	
	length: int
	_GetProgramInfoLog(program, buf, &length)
	return string(buf[:length])
}

GetShaderInfoLog :: proc "c" (shader: Shader, buf: []byte) -> string {
	@(default_calling_convention="c")
	foreign gl {
		@(link_name="GetShaderInfoLog")
		_GetShaderInfoLog :: proc "c" (shader: Shader, buf: []byte, length: ^int) ---
	}
	
	length: int
	_GetShaderInfoLog(shader, buf, &length)
	return string(buf[:length])
}



BufferDataSlice :: proc "c" (target: u32, slice: $S/[]$E, usage: u32) {
	BufferData(target, len(slice)*size_of(E), raw_data(slice), usage)
}
BufferSubDataSlice :: proc "c" (target: u32, offset: uintptr, slice: $S/[]$E) {
	BufferSubData(target, offset, len(slice)*size_of(E), raw_data(slice), usage)
}

CompressedTexImage2DSlice :: proc "c" (target: u32, level: i32, internalformat: u32, width, height: i32, border: i32, slice: $S/[]$E) {
	CompressedTexImage2DSlice(target, level, internalformat, width, height, border, len(slice)*size_of(E), raw_data(slice))
}
CompressedTexSubImage2DSlice :: proc "c" (target: u32, level: i32, xoffset, yoffset, width, height: i32, format: u32, slice: $S/[]$E) {
	CompressedTexSubImage2DSlice(target, level, level, xoffset, yoffset, width, height, format, len(slice)*size_of(E), raw_data(slice))
}

ReadPixelsSlice :: proc(x, y, width, height: i32, format: u32, type: u32, slice: $S/[]$E) {
	ReadnPixels(x, y, width, height, format, type, len(slice)*size_of(E), raw_data(slice))
}

TexImage2DSlice :: proc "c" (target: u32, level: i32, internalformat: u32, width, height: i32, border: i32, format, type: u32, slice: $S/[]$E) {
	TexImage2D(target, level, internalformat, width, height, border, format, type, len(slice)*size_of(E), raw_data(slice))
}
TexSubImage2DSlice :: proc "c" (target: u32, level: i32, xoffset, yoffset, width, height: i32, format, type: u32, slice: $S/[]$E) {
	TexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, len(slice)*size_of(E), raw_data(slice))
}