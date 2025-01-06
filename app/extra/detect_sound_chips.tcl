# Detect used Sound Chips
#
# Detection logic was taken from the script _vgmrecorder.tcl

namespace eval sound_detector {

variable psg_register -1
variable detected 0
variable currently_used 0

proc get_sound_chips {} {
	variable detected
	variable currently_used
	set currently_used_temp $currently_used
	set psg_register -1
	set currently_used 0
	return "$detected,$currently_used_temp"
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

proc detected_psg_address {} {
	variable psg_register $::wp_last_value
}

proc detected_psg_data {} {
	variable psg_register
	if {$psg_register >= 0 && $psg_register < 14} {
		variable detected
		variable currently_used
		set detected [expr {$detected | 1}]
		set currently_used [expr {$currently_used | 1}]
	}
}

proc detected_scc {} {
	variable detected
	variable currently_used
	set detected [expr {$detected | 2}]
	set currently_used [expr {$currently_used | 2}]
}

proc detected_sccp {} {
	variable detected
	variable currently_used
	set detected [expr {$detected | 4}]
	set currently_used [expr {$currently_used | 4}]
}

proc detected_pcm {} {
	variable detected
	variable currently_used
	set detected [expr {$detected | 8}]
	set currently_used [expr {$currently_used | 8}]
}

proc detected_msxmusic {} {
	variable detected
	variable currently_used
	set detected [expr {$detected | 16}]
	set currently_used [expr {$currently_used | 16}]
}

proc detected_msxaudio {} {
	variable detected
	variable currently_used
	set detected [expr {$detected | 32}]
	set currently_used [expr {$currently_used | 32}]
}

proc detected_moonsound {} {
	variable detected
	variable currently_used
	set detected [expr {$detected | 64}]
	set currently_used [expr {$currently_used | 64}]
}

# PSG
debug set_watchpoint write_io 0xA0 {} {sound_detector::detected_psg_address}
debug set_watchpoint write_io 0xA1 {} {sound_detector::detected_psg_data}

# SCC
foreach {ps ss plus} [find_all_scc] {
	if {$plus} {
		debug set_watchpoint write_mem {0xB800 0xB8AF} "\[watch_in_slot $ps $ss\]" {sound_detector::detected_sccp}
	} else {
		debug set_watchpoint write_mem {0x9800 0x988F} "\[watch_in_slot $ps $ss\]" {sound_detector::detected_scc}
	}
}

# PCM
#after time 5 "debug set_watchpoint write_io 0xA4 {} {sound_detector::detected_pcm}"
after time 5 "debug set_watchpoint write_io 0xA5 {} {sound_detector::detected_pcm}"

# MSX-MUSIC
#debug set_watchpoint write_io 0x7C {} {sound_detector::detected_msxmusic}
debug set_watchpoint write_io 0x7D {} {sound_detector::detected_msxmusic}

# MSX-AUDIO
#debug set_watchpoint write_io 0xC0 {} {sound_detector::detected_msxaudio}
debug set_watchpoint write_io 0xC1 {} {sound_detector::detected_msxaudio}

# Moonsound
#debug set_watchpoint write_io 0x7E {} {sound_detector::detected_moonsound}
debug set_watchpoint write_io 0x7F {} {sound_detector::detected_moonsound}
#debug set_watchpoint write_io 0xC4 {} {sound_detector::detected_moonsound}
#debug set_watchpoint write_io 0xC5 {} {sound_detector::detected_moonsound}
#debug set_watchpoint write_io 0xC6 {} {sound_detector::detected_moonsound}
#debug set_watchpoint write_io 0xC7 {} {sound_detector::detected_moonsound}

} ;# namespace sound_detector

namespace import sound_detector::*
