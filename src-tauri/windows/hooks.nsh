; NSIS installer hooks for Zainder Windows bundle
; Handles desktop shortcut and ensures any running instance of Zainder is cleanly closed before installing or uninstalling

!macro NSIS_HOOK_PREINSTALL
  ; Cerrar cualquier instancia previa de Zainder antes de actualizar o instalar
  nsExec::Exec 'taskkill /F /IM Zainder.exe /T'
  nsExec::Exec 'taskkill /F /IM zainder.exe /T'
!macroend

!macro NSIS_HOOK_POSTINSTALL
  MessageBox MB_YESNO|MB_ICONQUESTION "¿Desea crear un acceso directo en el Escritorio?" IDNO skip_desktop
  CreateShortCut "$DESKTOP\Zainder.lnk" "$INSTDIR\Zainder.exe" "" "$INSTDIR\Zainder.exe" 0
  skip_desktop:
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Terminar cualquier proceso en ejecución de Zainder para evitar que bloquee archivos durante la desinstalación
  nsExec::Exec 'taskkill /F /IM Zainder.exe /T'
  nsExec::Exec 'taskkill /F /IM zainder.exe /T'
  Sleep 600

  ; Eliminar acceso directo del escritorio si existe
  Delete "$DESKTOP\Zainder.lnk"
  Delete "$SMPROGRAMS\Zainder\Zainder.lnk"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$DESKTOP\Zainder.lnk"
  RMDir /r "$INSTDIR"
!macroend
