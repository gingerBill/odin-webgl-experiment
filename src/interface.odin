package main

import "core:runtime"
import "core:io"
import "core:fmt"
import "core:time"

foreign import "odin_env"
foreign import "gl"


@(default_calling_convention="c")
foreign odin_env {
	write :: proc(fd: u32, p: []byte) ---
	alert :: proc(s: string) ---
	trap  :: proc() -> ! ---
	abort :: proc() -> ! ---
	
	@(link_name="evaluate")
	eval :: proc(s: string) ---
	
	time_now :: proc() -> time.Duration ---
}

make_default_context :: proc() -> runtime.Context {
	c := context
	c.assertion_failure_proc = default_assertion_failure_proc
	return c
}

init_default_context: runtime.Context

@(export)
default_context :: proc "contextless" () -> ^runtime.Context {
	return &init_default_context
}

@(private)
make_context :: proc() -> runtime.Context {
	context = make_default_context()
	init_default_context = context
	return init_default_context
}


default_assertion_failure_proc :: proc(prefix, message: string, loc: runtime.Source_Code_Location) -> ! {
	eprintf("%v %v", loc, prefix)
	if len(message) > 0 {
		eprintf(": %v", message)
	}
	eprintln()
	trap()
}


write_vtable := &io.Stream_VTable{
	impl_write = proc(s: io.Stream, p: []byte) -> (n: int, err: io.Error) {
		fd := u32(uintptr(s.stream_data))
		write(fd, p)
		return len(p), nil
	},	
}

stdout := io.Writer{
	stream = {
		stream_vtable = write_vtable,
		stream_data = rawptr(uintptr(1)),
	},
}
stderr := io.Writer{
	stream = {
		stream_vtable = write_vtable,
		stream_data = rawptr(uintptr(2)),
	},
}

print    :: proc(args: ..any) { fmt.wprint(stdout, ..args) }
eprint   :: proc(args: ..any) { fmt.wprint(stderr, ..args) }
println  :: proc(args: ..any) { fmt.wprintln(stdout, ..args) }
eprintln :: proc(args: ..any) { fmt.wprintln(stderr, ..args) }
printf   :: proc(format: string, args: ..any) { fmt.wprintf(stdout, format, ..args) }
eprintf  :: proc(format: string, args: ..any) { fmt.wprintf(stderr, format, ..args) }