$ErrorActionPreference = "Stop"

$TaskName = "StartCareerPropelObservability"
$ScriptPath = "C:\Users\rajaj\career-ops\scripts\startup-observability.ps1"
$User = "rajaj"

Write-Host "Creating Windows Scheduled Task: $TaskName"
Write-Host "This will run $ScriptPath at user logon for $User."

# Define the action: run PowerShell.exe and pass the script
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""

# Define the trigger: at logon for the specific user
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $User

# Define the principal: run as the highest privileges if needed (not strictly required if it's just opening a browser, but good for docker)
# Note: Since it opens a browser, it must run interactively for the logged-in user.
$Principal = New-ScheduledTaskPrincipal -UserId $User -LogonType Interactive

# Define settings: do not stop on idle, allow start if on batteries
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd -ExecutionTimeLimit (New-TimeSpan -Days 1)

# Register the task
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force

Write-Host "Task '$TaskName' has been successfully created and registered!"
Write-Host "You can view it in the Task Scheduler console (taskschd.msc)."
