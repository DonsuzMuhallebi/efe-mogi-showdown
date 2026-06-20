; Custom NSIS: default install dir -> Steam-like  KlausennGames\common\EfeMogiShowdown
!macro preInit
  SetRegView 64
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\KlausennGames\common\EfeMogiShowdown"
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\KlausennGames\common\EfeMogiShowdown"
  SetRegView 32
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\KlausennGames\common\EfeMogiShowdown"
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\KlausennGames\common\EfeMogiShowdown"
!macroend
