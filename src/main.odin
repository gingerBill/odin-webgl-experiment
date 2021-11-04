package main

import gl "webgl"

vertex_source := `#version 100
precision mediump float;

attribute vec3 a_position;
attribute vec4 a_color;
attribute vec2 a_uv;

varying vec4 v_color;
varying vec2 v_uv;

uniform mat4 u_transform;

void main() {	
	gl_Position = u_transform * vec4(a_position, 1.0);
	v_color = a_color;
	v_uv = a_uv;
}
`

fragment_source := `#version 100
precision mediump float;

varying vec4 v_color;
varying vec2 v_uv;

uniform sampler2D u_sampler;

void main() {
	vec3 tex = texture2D(u_sampler, v_uv).rgb;
	tex *= pow(v_color.rgb, vec3(0.3));
	gl_FragColor = vec4(tex, v_color.a);
}
`

program: gl.Program
vertex_buffer: gl.Buffer
index_buffer: gl.Buffer
tex: gl.Texture

dog_bmp := #load("dog.bmp")

BMP_Header :: struct #packed {
	sig: [2]u8,
	file_size: u32,
	_: [4]u8,
	offset: u32,
	header_size: u32, // must be 40
	width: u32,
	height: u32,
	planes: u16, // must be 1
	bits_per_pixel: u16,
	compression_type: u32,
	h_pixels_per_metre: u32,
	v_pixels_per_metre: u32,
	colors_in_image: u32,
	important_colors_in_image: u32,
}

main :: proc() {
	context = make_context()

	println("Hellope!")
	
	vs := gl.CreateShader(gl.VERTEX_SHADER)
	fs := gl.CreateShader(gl.FRAGMENT_SHADER)
	gl.ShaderSource(vs, {vertex_source})
	gl.ShaderSource(fs, {fragment_source})
	gl.CompileShader(vs)
	if gl.GetShaderiv(vs, gl.COMPILE_STATUS) == 0 {
		eprintln("vertex shader compile failure")
		buf: [4096]byte
		log := gl.GetShaderInfoLog(vs, buf[:])
		eprintln(log)
		return
	}
	gl.CompileShader(fs)
	if gl.GetShaderiv(fs, gl.COMPILE_STATUS) == 0 {
		eprintln("fragment shader compile failure")
		buf: [4096]byte
		log := gl.GetShaderInfoLog(fs, buf[:])
		eprintln(log)
		return
	}
	
	program = gl.CreateProgram()
	gl.AttachShader(program, vs)
	gl.AttachShader(program, fs)
	gl.LinkProgram(program)
	
	gl.DetachShader(program, vs)
	gl.DetachShader(program, fs)
	gl.DeleteShader(vs)
	gl.DeleteShader(fs)
	
	if gl.GetProgramParameter(program, gl.LINK_STATUS) == 0 {
		eprintln("linking failure")
		buf: [4096]byte
		log := gl.GetProgramInfoLog(program, buf[:])
		eprintln(log)
		return
	}
	
	gl.UseProgram(program)

	gl.Enable(gl.TEXTURE_2D)
	gl.Enable(gl.BLEND)
	gl.BlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	
	header := (^BMP_Header)(&dog_bmp[0])
	image_width := i32(header.width)
	image_height := i32(header.height)
	image_bytes := dog_bmp[header.offset:]  //[:image_width*image_height*3]
	assert(image_width == 512)
	assert(image_height == 512)
	
	gl.ActiveTexture(gl.TEXTURE0)
	tex = gl.CreateTexture()
	gl.BindTexture(gl.TEXTURE_2D, tex)
	gl.TexImage2D(gl.TEXTURE_2D, 0, gl.RGB, image_width, image_height, 0, gl.RGB, gl.UNSIGNED_BYTE, len(image_bytes), raw_data(image_bytes))
	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, i32(gl.NEAREST))
	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, i32(gl.NEAREST))
	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, i32(gl.CLAMP_TO_EDGE))
	gl.TexParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, i32(gl.CLAMP_TO_EDGE))
	gl.GenerateMipmap(gl.TEXTURE_2D)
	gl.Uniform1i(gl.GetUniformLocation(program, "u_sampler"), 0)
	
	a_position := gl.GetAttribLocation(program, "a_position")
	a_color    := gl.GetAttribLocation(program, "a_color")
	a_uv       := gl.GetAttribLocation(program, "a_uv")
	
	Vertex :: struct {
		pos: [3]f32,
		col: [4]f32,
		uv:  [2]f32,
	}
	
	vertex_buffer = gl.CreateBuffer()
	gl.BindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
	gl.BufferDataSlice(gl.ARRAY_BUFFER, []Vertex{
		{{-0.5, +0.5, 0}, {1.0, 0.0, 0.0, 1.0}, {0, 1}},
		{{-0.5, -0.5, 0}, {1.0, 1.0, 0.0, 1.0}, {0, 0}},
		{{+0.5, -0.5, 0}, {0.0, 1.0, 0.0, 1.0}, {1, 0}},
		{{+0.5, +0.5, 0}, {0.0, 0.0, 1.0, 1.0}, {1, 1}},
	}, gl.STATIC_DRAW)
	gl.EnableVertexAttribArray(a_position)
	gl.EnableVertexAttribArray(a_color)
	gl.EnableVertexAttribArray(a_uv)
	gl.VertexAttribPointer(a_position, 3, gl.FLOAT, false, size_of(Vertex), offset_of(Vertex, pos))
	gl.VertexAttribPointer(a_color,    4, gl.FLOAT, false, size_of(Vertex), offset_of(Vertex, col))
	gl.VertexAttribPointer(a_uv,       2, gl.FLOAT, false, size_of(Vertex), offset_of(Vertex, uv))

	index_buffer = gl.CreateBuffer()
	gl.BindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
	gl.BufferDataSlice(gl.ELEMENT_ARRAY_BUFFER, []u16{
		0, 1, 2,
		2, 3, 0,
	}, gl.STATIC_DRAW)
}

@(export)
step :: proc(dt: f64) {
	@static total_time: f64
	defer total_time += dt
	
	gl.Viewport(0, 0, 640, 480)
	gl.ClearColor(0.5, 0.7, 1.0, 1.0)
	gl.Clear(gl.COLOR_BUFFER_BIT)
	
		
	// model := gl.mat4Translate({
	// 	0.3*gl.cos(f32(total_time*3)),	
	// 	0.3*gl.sin(f32(total_time*3)),
	// 	0.5*gl.sin(f32(total_time*5)),
	// })
	model := gl.mat4Rotate({0, 1, 1}, f32(total_time))
	
	view := gl.mat4LookAt(gl.vec3{0, -1, +1}, {0, 0, 0}, {0, 0, 1})
	proj := gl.mat4Perspective(45, 1.3, 0.1, 100.0)
		
	gl.UniformMatrix4fv(
		gl.GetUniformLocation(program, "u_transform"), 
		proj * view * model,
	)
		
	gl.DrawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, nil)
}
