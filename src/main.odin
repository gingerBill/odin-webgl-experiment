package main

import gl "webgl"

vertex_source := `#version 100
precision mediump float;

attribute vec3 a_position;
attribute vec4 a_color;

varying vec4 v_color;

uniform mat4 u_transform;

void main() {	
	gl_Position = u_transform * vec4(a_position, 1.0);
	v_color = a_color;
}
`

fragment_source := `#version 100
precision mediump float;

varying vec4 v_color;

void main() {
	gl_FragColor = v_color;
}
`

program: gl.Program
vertex_buffer: gl.Buffer

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
	
	a_position := gl.GetAttribLocation(program, "a_position")
	a_color    := gl.GetAttribLocation(program, "a_color")
	
	Vertex :: struct {
		pos: [3]f32,
		col: [4]f32,
	}
	
	vertex_buffer = gl.CreateBuffer()
	gl.BindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
	gl.BufferDataSlice(gl.ARRAY_BUFFER, []Vertex{
		{{-0.5, +0.5, 0}, {1.0, 0.0, 0.0, 1.0}},
		{{-0.5, -0.5, 0}, {1.0, 1.0, 0.0, 1.0}},
		{{+0.5, -0.5, 0}, {0.0, 1.0, 0.0, 1.0}},
		
		{{+0.5, -0.5, 0}, {0.0, 1.0, 0.0, 1.0}},
		{{+0.5, +0.5, 0}, {0.0, 0.0, 1.0, 1.0}},
		{{-0.5, +0.5, 0}, {1.0, 0.0, 0.0, 1.0}},
		
		{{-0.5, +0.5, 1}, {1.0, 0.0, 0.0, 1.0}},
		{{-0.5, -0.5, 1}, {1.0, 1.0, 0.0, 1.0}},
		{{+0.5, -0.5, 1}, {0.0, 1.0, 0.0, 1.0}},
		
		{{+0.5, -0.5, 1}, {0.0, 1.0, 0.0, 1.0}},
		{{+0.5, +0.5, 1}, {0.0, 0.0, 1.0, 1.0}},
		{{-0.5, +0.5, 1}, {1.0, 0.0, 0.0, 1.0}},
	}, gl.STATIC_DRAW)
	gl.EnableVertexAttribArray(a_position)
	gl.EnableVertexAttribArray(a_color)
	gl.VertexAttribPointer(a_position, 3, gl.FLOAT, false, size_of(Vertex), offset_of(Vertex, pos))
	gl.VertexAttribPointer(a_color, 4, gl.FLOAT, false, size_of(Vertex), offset_of(Vertex, col))
}

@(export)
step :: proc(dt: f64) {
	@static total_time: f64
	defer total_time += dt
	
	gl.Viewport(0, 0, 640, 480)
	gl.ClearColor(0.5, 0.7, 1.0, 1.0)
	gl.Clear(gl.COLOR_BUFFER_BIT)
	gl.UseProgram(program)
		
	model := gl.mat4Translate({
		0.3*gl.cos(f32(total_time*3)),	
		0.3*gl.sin(f32(total_time*3)),
		0.0,
	})
	model = model * gl.mat4Rotate({0, 1, 1}, f32(-total_time*5))
	
	view := gl.mat4LookAt(gl.vec3{-1, +1, +1}*2, {0, 0, 0}, {0, 0, 1})
	proj := gl.mat4Perspective(45, 1.3, 0.1, 100.0)
	
	x := matrix_flatten(proj)
		
	gl.UniformMatrix4fv(
		gl.GetUniformLocation(program, "u_transform"), 
		proj * view * model,
	)
		
	gl.DrawArrays(gl.TRIANGLES, 0, 12)	
}
