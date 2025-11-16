# Copy BASIC listing to clipboard if there is a listing
#
# Logic of stripping memory addresses was taken from @FiXato's script at https://gist.github.com/FiXato/c0bdb9352d1eee4fa57d6ab68e80476d

namespace eval basic_listing_copier {

	proc copy_listing {} {
		set result [regsub -all -line {^[0-9a-f]x[0-9a-f]{4} > } [ listing ] ""]

		if {$result ne ""} {
			set_clipboard_text $result
			return true
		} else {
			return false
		}
	}
}

namespace import basic_listing_copier::*