# Add extension gfx9000 if it doesn't exist and switch display to GFX9000
#
# Thanks to @MBilderbeek from the openMSX team for providing the logic of detecting if GFX9000 is present

after time 0 {
	if {[lsearch [lindex [openmsx_info setting videosource] 2] GFX9000] == -1} { ext gfx9000 }
}

after time 10 "set videosource GFX9000"