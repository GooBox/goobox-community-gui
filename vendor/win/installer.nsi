!macro customInstall
    ExecShell open '"$SYSDIR\regsvr32.exe" "$INSTDIR\resources\libraries\GooboxOverlay1OK_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "$INSTDIR\resources\libraries\GooboxOverlay2Syncing_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "$INSTDIR\resources\libraries\GooboxOverlay3Warning_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "$INSTDIR\resources\libraries\GooboxOverlay4Error_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "$INSTDIR\resources\libraries\GooboxContextMenus_x64.dll"'
!macroend

!macro customUnInit
    ExecShell open '"$SYSDIR\regsvr32.exe" "-u" "$INSTDIR\resources\libraries\GooboxOverlay1OK_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "-u" "$INSTDIR\resources\libraries\GooboxOverlay2Syncing_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "-u" "$INSTDIR\resources\libraries\GooboxOverlay3Warning_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "-u" "$INSTDIR\resources\libraries\GooboxOverlay4Error_x64.dll"'
    ExecShell open '"$SYSDIR\regsvr32.exe" "-u" "$INSTDIR\resources\libraries\GooboxContextMenus_x64.dll"'
!macroend
