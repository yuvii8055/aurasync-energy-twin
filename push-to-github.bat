@echo off
echo ===================================================
echo 🚀 Pushing updated AuraSync build to GitHub...
echo ===================================================
cd /d "%~dp0"
git push origin main
echo.
echo ===================================================
echo ✅ Pushed successfully! Render will now build in 10s.
echo ===================================================
pause
