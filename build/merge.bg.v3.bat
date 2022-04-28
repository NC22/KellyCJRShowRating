@echo off
pushd "%~1"

SET background=background.js

break>%background%

for %%x in ( 
    "%~dp0..\lib\kellyTools.js" 
    "%~dp0..\lib\kellyDispetcher.js" 
) do (
    
    @echo.>> %background%
    @echo.>> %background%    
    copy %background% + "%%~x" %background%
)

  
    @echo.>> %background%
    @echo.>> %background%       
    @echo.>> %background%
    @echo.>> %background% 
    
popd
pause