# Add extension gfx9000 if it doesn't exist and switch display to GFX9000
#
# Thanks to @MBilderbeek from the openMSX team for providing the logic of detecting if GFX9000 is present

set devices [machine_info device]
set found false
foreach device $devices {
	set found [expr {[dict get [machine_info device $device] type] eq "V9990"}]
	if {$found} { break }
}
if {!$found} { ext gfx9000 }

after time 10 "set videosource GFX9000"