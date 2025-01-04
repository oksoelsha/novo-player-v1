# Detect used Sound Chips
#
# Detection logic was taken from the script _vgmrecorder.tcl

namespace eval sound_detector {

variable chips 0
variable first_detection_time 0

proc get_detected_chips {} {
	variable chips
	variable first_detection_time
	return "$first_detection_time,$chips"
}

proc find_all_scc {} {
	set result [list]
	for {set ps 0} {$ps < 4} {incr ps} {
		for {set ss 0} {$ss < 4} {incr ss} {
			set device_list [machine_info slot $ps $ss 2]
			if {[llength $device_list] != 0} {
				set device [lindex $device_list 0]
				set device_info_dict [machine_info device $device]
				set device_type [dict get $device_info_dict "type"]
				if {[string match -nocase *scc* $device_type]} {
					lappend result $ps $ss 1
				} elseif {[dict exists $device_info_dict "mappertype"]} {
					set mapper_type [dict get $device_info_dict "mappertype"]
					if {[string match -nocase *scc* $mapper_type] ||
					    [string match -nocase manbow2 $mapper_type] ||
					    [string match -nocase KonamiUltimateCollection $mapper_type]} {
						lappend result $ps $ss 0
					}
				}
			}
			if {![machine_info issubslotted $ps]} break
		}
	}
	return $result
}

proc detected_psg {} {
	variable chips
	set chips [expr {$chips | 1}]
	variable first_detection_time
	set first_detection_time [clock seconds]
}

proc detected_scc {} {
	variable chips
	set chips [expr {$chips | 2}]
}

proc detected_sccp {} {
	variable chips
	set chips [expr {$chips | 4}]
}

proc detected_pcm {} {
	variable chips
	set chips [expr {$chips | 8}]
}

proc detected_msxmusic {} {
	variable chips
	set chips [expr {$chips | 16}]
}

proc detected_msxaudio {} {
	variable chips
	set chips [expr {$chips | 32}]
}

proc detected_moonsound {} {
	variable chips
	set chips [expr {$chips | 64}]
}

# PSG
#after time 5 "debug set_watchpoint -once write_io 0xA0 {} {sound_detector::detected_psg}"
after time 5 "debug set_watchpoint -once write_io 0xA1 {} {sound_detector::detected_psg}"

# SCC
foreach {ps ss plus} [find_all_scc] {
	if {$plus} {
		debug set_watchpoint -once write_mem {0xB800 0xB8AF} "\[watch_in_slot $ps $ss\]" {sound_detector::detected_sccp}
	} else {
		debug set_watchpoint -once write_mem {0x9800 0x988F} "\[watch_in_slot $ps $ss\]" {sound_detector::detected_scc}
	}
}

# PCM
#after time 5 "debug set_watchpoint -once write_io 0xA4 {} {sound_detector::detected_pcm}"
after time 5 "debug set_watchpoint -once write_io 0xA5 {} {sound_detector::detected_pcm}"

# MSX-MUSIC
#debug set_watchpoint -once write_io 0x7C {} {sound_detector::detected_msxmusic}
debug set_watchpoint -once write_io 0x7D {} {sound_detector::detected_msxmusic}

# MSX-AUDIO
#debug set_watchpoint -once write_io 0xC0 {} {sound_detector::detected_msxaudio}
debug set_watchpoint -once write_io 0xC1 {} {sound_detector::detected_msxaudio}

# Moonsound
#debug set_watchpoint -once write_io 0x7E {} {sound_detector::detected_moonsound}
#debug set_watchpoint -once write_io 0x7F {} {sound_detector::detected_moonsound}
#debug set_watchpoint -once write_io 0xC4 {} {sound_detector::detected_moonsound}
debug set_watchpoint -once write_io 0xC5 {} {sound_detector::detected_moonsound}
debug set_watchpoint -once write_io 0xC6 {} {sound_detector::detected_moonsound}
#debug set_watchpoint -once write_io 0xC7 {} {sound_detector::detected_moonsound}

} ;# namespace sound_detector

namespace import sound_detector::*
