# Detect used Sound Chips
#
# Detection logic was taken from the script _vgmrecorder.tcl

namespace eval sound_detector {

variable psg_register -1
variable opl4_register_wave -1
variable opl4_register -1
variable detected 0
variable currently_used 0

proc get_sound_chips {} {
	variable detected
	variable currently_used
	set currently_used_temp $currently_used
	set psg_register -1
	set opl4_register_wave -1
	set opl4_register -1
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
		sound_detector::process_detection 1 
	}
}

proc detected_scc {} {
	sound_detector::process_detection 2
}

proc detected_sccp {} {
	sound_detector::process_detection 4
}

proc detected_pcm {} {
	sound_detector::process_detection 8
}

proc detected_msxmusic {} {
	sound_detector::process_detection 16
}

proc detected_msxaudio {} {
	sound_detector::process_detection 32
}

proc detected_moonsound {} {
	sound_detector::process_detection 64
}

proc detect_moonsound_address_wave {} {
	variable opl4_register_wave $::wp_last_value
}

proc detect_moonsound_data_wave {} {
	variable opl4_register_wave
	if {$opl4_register_wave >= 0} {
		sound_detector::detected_moonsound
	}
}

proc detect_moonsound_address_1_or_2 {} {
	variable opl4_register $::wp_last_value
}

proc detect_moonsound_data {} {
	variable opl4_register
	if {$opl4_register >= 0} {
		sound_detector::detected_moonsound
	}
}

proc detected_SN76489 {} {
	if {$::wp_last_value > 0} {
		sound_detector::process_detection 1
	}
}

proc process_detection {mask} {
	variable detected
	variable currently_used
	set detected [expr {$detected | $mask}]
	set currently_used [expr {$currently_used | $mask}]
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
debug set_watchpoint write_io 0x7E {} {sound_detector::detect_moonsound_address_wave}
debug set_watchpoint write_io 0x7F {} {sound_detector::detect_moonsound_data_wave}
debug set_watchpoint write_io 0xC4 {} {sound_detector::detect_moonsound_address_1_or_2}
debug set_watchpoint write_io 0xC5 {} {sound_detector::detect_moonsound_data}
debug set_watchpoint write_io 0xC6 {} {sound_detector::detect_moonsound_address_1_or_2}
debug set_watchpoint write_io 0xC7 {} {sound_detector::detect_moonsound_data}

# Coleco's SN76489
debug set_watchpoint write_io 0xFF {} {sound_detector::detected_SN76489}

# Sega's SN76489
debug set_watchpoint write_io 0x7F {} {sound_detector::detected_SN76489}

} ;# namespace sound_detector

namespace import sound_detector::*
