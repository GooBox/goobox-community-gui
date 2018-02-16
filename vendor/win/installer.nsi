!macro customInstall
    !include x64.nsh
    ${DisableX64FSRedirection}
    SetOutPath $INSTDIR\resources\libraries
    ExecWait '"$SYSDIR\regsvr32.exe" "-s" "$INSTDIR\resources\libraries\GooboxOverlay1OK_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-s" "$INSTDIR\resources\libraries\GooboxOverlay2Syncing_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-s" "$INSTDIR\resources\libraries\GooboxOverlay3Warning_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-s" "$INSTDIR\resources\libraries\GooboxOverlay4Error_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-s" "$INSTDIR\resources\libraries\GooboxContextMenus_x64.dll"'
	ExecWait "taskkill /F /IM explorer.exe"
	Sleep 500
	ExecWait "explorer.exe"
!macroend

!macro customUnInit
    ExecWait '"$SYSDIR\regsvr32.exe" "-u" "-s" "$INSTDIR\resources\libraries\GooboxOverlay1OK_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-u" "-s" "$INSTDIR\resources\libraries\GooboxOverlay2Syncing_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-u" "-s" "$INSTDIR\resources\libraries\GooboxOverlay3Warning_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-u" "-s" "$INSTDIR\resources\libraries\GooboxOverlay4Error_x64.dll"'
    ExecWait '"$SYSDIR\regsvr32.exe" "-u" "-s" "$INSTDIR\resources\libraries\GooboxContextMenus_x64.dll"'
!macroend

!macro customUnInstall
    RMDir /r "$LOCALAPPDATA\Goobox\Logs"
    Delete "$LOCALAPPDATA\Goobox\api.storj.io.json"
    # For debugging: disable deleting sia directory.
    # RMDir /r "$LOCALAPPDATA\Goobox\sia"
!macroend

!macro customRemoveFiles
    RMDir /r /REBOOTOK $INSTDIR
!macroend