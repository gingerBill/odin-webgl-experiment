package webgl

foreign import "gl"

Program :: distinct u32
Shader  :: distinct u32
Texture :: distinct u32
Buffer  :: distinct u32

@(default_calling_convention="c")
foreign gl {
	GetError :: proc() -> u32 ---
	
	Clear      :: proc(bits: u32) ---
	Viewport   :: proc(x, y, w, h: i32) ---
	ClearColor :: proc(r, g, b, a: f32) ---
	
	CreateBuffer :: proc() -> Buffer ---
	GenBuffers   :: proc(n: int, buffers: [^]Buffer) ---
	BindBuffer   :: proc(target: u32, buffer: Buffer) ---
	BufferData   :: proc(target: u32, size: int, data: rawptr, usage: u32) ---
	
	CreateShader  :: proc(shaderType: u32) -> Shader ---
	DeleteShader  :: proc(shader: Shader) ---
	ShaderSource  :: proc(shader: Shader, strings: []string) ---
	DetachShader  :: proc(program: Program, shader: Shader) ---
	AttachShader  :: proc(program: Program, shader: Shader) ---
	CompileShader :: proc(shader: Shader) ---
	
	CreateProgram           :: proc() -> Program ---
	DeleteProgram           :: proc(program: Program) ---
	UseProgram              :: proc(program: Program) ---
	LinkProgram             :: proc(program: Program) ---
	EnableVertexAttribArray :: proc(index: int) ---
	GetAttribLocation       :: proc(program: Program, name: string) -> int ---
	ValidateProgram         :: proc(program: Program) ---
	GetProgramParameter     :: proc(program: Program, pname: u32) -> i32 ---
		
	BindAttribLocation  :: proc(program: Program, index: int, name: string) ---
	VertexAttribPointer :: proc(index: int, size: int, type: u32, normalized: bool, stride: int, ptr: uintptr) ---
	
	GetUniformLocation :: proc(program: Program, name: string) -> int ---
	
	Uniform1f :: proc(location: int, v0: f32) ---
	Uniform2f :: proc(location: int, v0, v1: f32) ---
	Uniform3f :: proc(location: int, v0, v1, v2: f32) ---
	Uniform4f :: proc(location: int, v0, v1, v2, v3: f32) ---
	
	Uniform1i :: proc(location: int, v0: i32) ---
	Uniform2i :: proc(location: int, v0, v1: i32) ---
	Uniform3i :: proc(location: int, v0, v1, v2: i32) ---
	Uniform4i :: proc(location: int, v0, v1, v2, v3: i32) ---
	
	CreateTexture :: proc() -> Texture ---
	GenTextures   :: proc(n: int, textures: [^]Texture) ---
	ActiveTexture :: proc(x: Texture) ---
	BindTexture   :: proc(target: u32, texture: Texture) ---
	TexParameteri :: proc(x0, x1, x2: u32) ---
	
	DrawElements :: proc(mode: u32, count: int, type: u32, indices: rawptr) ---
	DrawArrays   :: proc(mode: u32, first, count: int) ---
}


UniformMatrix2fv :: proc(location: int, m: mat2) {
	foreign gl {
		@(link_name="UniformMatrix2fv")
		_UniformMatrix2fv :: proc(location: int, value: [^]f32) ---
	}
	value := transmute([2*2]f32)m
	_UniformMatrix2fv(location, &value[0])
}
UniformMatrix3fv :: proc(location: int, m: mat3) {
	foreign gl {
		@(link_name="UniformMatrix3fv")
		_UniformMatrix3fv :: proc(location: int, value: [^]f32) ---
	}
	value := transmute([3*3]f32)m
	_UniformMatrix3fv(location, &value[0])
}
UniformMatrix4fv :: proc(location: int, m: mat4) {
	foreign gl {
		@(link_name="UniformMatrix4fv")
		_UniformMatrix4fv :: proc(location: int, value: [^]f32) ---
	}
	value := transmute([4*4]f32)m
	_UniformMatrix4fv(location, &value[0])
}

GetShaderiv :: proc(shader: Shader, pname: u32) -> (p: i32) {
	@(default_calling_convention="c")
	foreign gl {
		@(link_name="GetShaderiv")
		_GetShaderiv :: proc(shader: Shader, pname: u32, p: ^i32) ---
	}
	_GetShaderiv(shader, pname, &p)
	return
}


GetProgramInfoLog :: proc(program: Program, buf: []byte) -> string {
	@(default_calling_convention="c")
	foreign gl {
		@(link_name="GetProgramInfoLog")
		_GetProgramInfoLog :: proc(program: Program, buf: []byte, length: ^int) ---
	}
	
	length: int
	_GetProgramInfoLog(program, buf, &length)
	return string(buf[:length])
}

GetShaderInfoLog :: proc(shader: Shader, buf: []byte) -> string {
	@(default_calling_convention="c")
	foreign gl {
		@(link_name="GetShaderInfoLog")
		_GetShaderInfoLog :: proc(shader: Shader, buf: []byte, length: ^int) ---
	}
	
	length: int
	_GetShaderInfoLog(shader, buf, &length)
	return string(buf[:length])
}


BufferDataSlice :: proc "c" (target: u32, slice: $S/[]$E, usage: u32) {
	BufferData(target, len(slice)*size_of(E), raw_data(slice), usage)
}
