# Pre-Deployment Verification Script

Write-Host "================================" -ForegroundColor Cyan
Write-Host "HealthMate Backend - Pre-Deployment Check" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$allGood = $true

# Check if .env exists
Write-Host "✓ Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "  ✅ .env file found" -ForegroundColor Green
    
    # Read .env and check for critical values
    $envContent = Get-Content .env -Raw
    
    if ($envContent -match "JWT_SECRET=nothing" -or $envContent -match "JWT_SECRET=your_production") {
        Write-Host "  ❌ JWT_SECRET is not set to a strong value!" -ForegroundColor Red
        Write-Host "     Generate one using the command below`n" -ForegroundColor Yellow
        $allGood = $false
    } else {
        Write-Host "  ✅ JWT_SECRET appears to be set" -ForegroundColor Green
    }
    
    if ($envContent -match "MONGODB_URI=mongodb\+srv://.*@") {
        Write-Host "  ✅ MongoDB URI appears configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  MongoDB URI might not be configured" -ForegroundColor Yellow
        $allGood = $false
    }
    
} else {
    Write-Host "  ⚠️  .env file not found (OK if deploying to Railway)" -ForegroundColor Yellow
}

Write-Host "`n✓ Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path .gitignore) {
    $gitignoreContent = Get-Content .gitignore -Raw
    if ($gitignoreContent -match ".env") {
        Write-Host "  ✅ .gitignore includes .env" -ForegroundColor Green
    } else {
        Write-Host "  ❌ .gitignore doesn't protect .env file!" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ❌ .gitignore file missing!" -ForegroundColor Red
    $allGood = $false
}

Write-Host "`n✓ Checking package.json..." -ForegroundColor Yellow
if (Test-Path package.json) {
    $packageJson = Get-Content package.json | ConvertFrom-Json
    
    if ($packageJson.scripts.start) {
        Write-Host "  ✅ 'start' script found: $($packageJson.scripts.start)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ 'start' script missing in package.json!" -ForegroundColor Red
        $allGood = $false
    }
    
    $requiredDeps = @('express', 'mongoose', 'dotenv', 'jsonwebtoken', 'bcryptjs', 'cloudinary')
    $missingDeps = @()
    
    foreach ($dep in $requiredDeps) {
        if (-not $packageJson.dependencies.$dep) {
            $missingDeps += $dep
        }
    }
    
    if ($missingDeps.Count -eq 0) {
        Write-Host "  ✅ All required dependencies present" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing dependencies: $($missingDeps -join ', ')" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ❌ package.json not found!" -ForegroundColor Red
    $allGood = $false
}

Write-Host "`n✓ Checking Railway deployment files..." -ForegroundColor Yellow
if (Test-Path Procfile) {
    Write-Host "  ✅ Procfile found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Procfile missing (Railway can use package.json start script)" -ForegroundColor Yellow
}

if (Test-Path railway.json) {
    Write-Host "  ✅ railway.json found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  railway.json missing (optional)" -ForegroundColor Yellow
}

Write-Host "`n✓ Checking documentation..." -ForegroundColor Yellow
$docFiles = @('README.md', 'RAILWAY_DEPLOYMENT.md', '.env.example')
foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        Write-Host "  ✅ $doc exists" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $doc missing" -ForegroundColor Yellow
    }
}

Write-Host "`n✓ Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
if ($LASTEXITCODE -eq 0) {
    if ($gitStatus) {
        Write-Host "  ⚠️  You have uncommitted changes:" -ForegroundColor Yellow
        git status -s
        Write-Host "  Run: git add . && git commit -m 'Ready for deployment'" -ForegroundColor Cyan
    } else {
        Write-Host "  ✅ All changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Not a git repository or git not installed" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ All critical checks passed!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Generate a strong JWT_SECRET (command below)" -ForegroundColor White
    Write-Host "2. Commit and push to GitHub" -ForegroundColor White
    Write-Host "3. Follow RAILWAY_DEPLOYMENT.md" -ForegroundColor White
} else {
    Write-Host "❌ Some issues need attention!" -ForegroundColor Red
    Write-Host "Please fix the issues above before deploying.`n" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Generate Strong JWT Secret" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Run this command to generate a secure JWT_SECRET:`n" -ForegroundColor Yellow
Write-Host "-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]`$_})" -ForegroundColor Green
Write-Host "`nThen add it to Railway environment variables!`n" -ForegroundColor Yellow
