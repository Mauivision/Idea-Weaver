#!/bin/bash

# 🚀 Idea Weaver Deployment Script
# Automated deployment for the Idea Weaver application
# Usage: ./deploy.sh [--skip-tests] [--skip-build] [--local] [--help]

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="${SCRIPT_DIR}"

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_ERROR=1
readonly EXIT_BUILD_ERROR=2
readonly EXIT_TEST_ERROR=3
readonly EXIT_DEPLOY_ERROR=4

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

# Deployment flags
SKIP_TESTS=false
SKIP_BUILD=false
LOCAL_MODE=false

# ============================================================================
# Utility Functions
# ============================================================================

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

print_header() {
    echo -e "${GREEN}================================${NC}" >&2
    echo -e "${GREEN}$1${NC}" >&2
    echo -e "${GREEN}================================${NC}" >&2
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    --skip-tests     Skip running tests before deployment
    --skip-build     Skip building the project (requires existing build/)
    --local          Build only, skip Vercel deployment
    --help           Show this help message

Examples:
    $0                    # Full deployment with tests and build
    $0 --skip-tests       # Deploy without running tests
    $0 --local            # Build only, for local testing
    $0 --skip-build --local  # Use existing build for local testing
EOF
}

# ============================================================================
# Validation Functions
# ============================================================================

validate_project_root() {
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        print_error "package.json not found. This script must be run from the Idea Weaver project root directory."
        exit ${EXIT_ERROR}
    fi
    
    if [[ ! -f "${PROJECT_ROOT}/src/App.tsx" ]]; then
        print_warning "src/App.tsx not found. This might not be the correct project directory."
    fi
}

check_command() {
    local cmd=$1
    if ! command -v "${cmd}" &> /dev/null; then
        return 1
    fi
    return 0
}

# ============================================================================
# Environment Setup
# ============================================================================

setup_environment() {
    print_status "Setting up environment variables..."
    
    local env_file="${PROJECT_ROOT}/.env.local"
    
    if [[ ! -f "${env_file}" ]]; then
        cat > "${env_file}" << 'ENVEOF'
# Idea Weaver Environment Variables
REACT_APP_API_URL=https://your-domain.vercel.app
REACT_APP_VERSION=1.0.0

# Optional: Analytics
REACT_APP_GA_ID=your_google_analytics_id

# Optional: Error Tracking
REACT_APP_SENTRY_DSN=your_sentry_dsn
ENVEOF
        print_warning "Created .env.local file. Environment variables are optional for this project."
        print_status "Please review and update .env.local with your actual values if needed."
    else
        print_success ".env.local already exists, preserving existing configuration."
    fi
}

# ============================================================================
# Dependency Management
# ============================================================================

install_dependencies() {
    print_status "Installing dependencies..."
    
    if ! npm install; then
        print_error "Failed to install dependencies. Please check your package.json and try again."
        exit ${EXIT_ERROR}
    fi
    
    print_success "Dependencies installed successfully!"
}

# ============================================================================
# Testing
# ============================================================================

run_tests() {
    if [[ "${SKIP_TESTS}" == "true" ]]; then
        print_warning "Skipping tests (--skip-tests flag provided)"
        return 0
    fi
    
    print_status "Running tests..."
    
    # Capture test output but allow non-zero exit codes
    local test_output
    local test_exit_code
    
    set +e
    test_output=$(npm run test -- --passWithNoTests 2>&1)
    test_exit_code=$?
    set -e
    
    if [[ ${test_exit_code} -eq 0 ]]; then
        print_success "Tests passed!"
        return 0
    fi
    
    # Check if tests actually exist
    if echo "${test_output}" | grep -q "No tests found"; then
        print_success "Tests completed (no tests found, but that's okay)."
        return 0
    fi
    
    # Tests failed
    print_warning "Tests failed or encountered an error."
    print_warning "Exit code: ${test_exit_code}"
    print_warning "Continue anyway? (Use --skip-tests to skip tests in future runs)"
    
    read -p "Press Enter to continue or Ctrl+C to abort..." || {
        print_error "Deployment aborted by user."
        exit ${EXIT_TEST_ERROR}
    }
    
    return 0
}

# ============================================================================
# Build Process
# ============================================================================

build_project() {
    if [[ "${SKIP_BUILD}" == "true" ]]; then
        print_warning "Skipping build (--skip-build flag provided)"
        
        if [[ ! -d "${PROJECT_ROOT}/build" ]]; then
            print_error "Build directory not found and --skip-build was used. Cannot deploy without a build."
            exit ${EXIT_BUILD_ERROR}
        fi
        
        print_success "Using existing build directory."
        return 0
    fi
    
    print_status "Building project..."
    
    if ! npm run build; then
        print_error "Build failed! Please check the errors above and fix them before deploying."
        exit ${EXIT_BUILD_ERROR}
    fi
    
    print_success "Build completed successfully!"
}

# ============================================================================
# Local Testing
# ============================================================================

show_local_testing_info() {
    print_header "🧪 Local Testing Mode"
    print_status "Skipping Vercel deployment (local mode)"
    print_status "Build files are ready in the 'build' directory"
    
    print_success "✅ Build completed successfully!"
    echo ""
    print_status "Your application is ready for testing!"
    print_status "To serve the build locally, run one of these commands:"
    
    if check_command serve; then
        print_status "  - serve -s build"
    else
        print_status "  - npx serve -s build"
        print_status "  - Or install serve globally: npm install -g serve"
    fi
    
    print_status "  - python -m http.server 8000 -d build"
    print_status "  - npm start (for development server)"
    echo ""
}

# ============================================================================
# Vercel Deployment
# ============================================================================

ensure_vercel_cli() {
    if check_command vercel; then
        return 0
    fi
    
    print_status "Installing Vercel CLI..."
    
    if ! npm install -g vercel; then
        print_error "Failed to install Vercel CLI. Please install it manually: npm install -g vercel"
        exit ${EXIT_DEPLOY_ERROR}
    fi
    
    print_success "Vercel CLI installed successfully."
}

link_vercel_project() {
    if [[ -f "${PROJECT_ROOT}/.vercel/project.json" ]]; then
        print_success "Project already linked to Vercel."
        return 0
    fi
    
    print_status "Linking project to Vercel..."
    
    if ! vercel link --yes; then
        print_error "Failed to link project to Vercel. Please check your Vercel account and try again."
        exit ${EXIT_DEPLOY_ERROR}
    fi
    
    print_success "Project linked to Vercel successfully."
}

deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    ensure_vercel_cli
    link_vercel_project
    
    print_status "Deploying to production..."
    
    if ! vercel --prod; then
        print_error "Deployment to Vercel failed!"
        exit ${EXIT_DEPLOY_ERROR}
    fi
    
    print_success "✅ Idea Weaver deployed successfully!"
}

# ============================================================================
# Post-Deployment Setup
# ============================================================================

create_github_pages_script() {
    local script_path="${PROJECT_ROOT}/deploy-github-pages.sh"
    
    cat > "${script_path}" << 'GH_EOF'
#!/bin/bash

# 🚀 Idea Weaver GitHub Pages Deployment Script
# Alternative deployment to GitHub Pages
# Usage: ./deploy-github-pages.sh

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

print_header() {
    echo -e "${GREEN}================================${NC}" >&2
    echo -e "${GREEN}$1${NC}" >&2
    echo -e "${GREEN}================================${NC}" >&2
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "This script must be run from the Idea Weaver project root directory"
    exit 1
fi

print_header "🚀 GitHub Pages Deployment"

# Build the project
print_status "Building project..."
if ! npm run build; then
    print_error "Build failed! Please check the errors above."
    exit 1
fi
print_success "Build completed successfully!"

# Create docs directory for GitHub Pages
print_status "Preparing docs directory..."
if [[ -d "docs" ]]; then
    print_warning "docs directory already exists. Backing up..."
    mv docs "docs.backup.$(date +%s)"
fi

mkdir -p docs

# Copy build files to docs
print_status "Copying build files to docs directory..."
if [[ ! -d "build" ]]; then
    print_error "Build directory not found. Please run 'npm run build' first."
    exit 1
fi

if ! cp -r build/* docs/; then
    print_error "Failed to copy build files to docs directory."
    exit 1
fi
print_success "Files copied successfully!"

# Create .nojekyll file to prevent Jekyll processing
print_status "Creating .nojekyll file..."
touch docs/.nojekyll

print_success "✅ GitHub Pages deployment ready!"
echo ""
print_status "Next steps:"
print_status "1. Review the docs directory"
print_status "2. Commit and push: git add docs && git commit -m 'Deploy to GitHub Pages' && git push"
print_status "3. Enable GitHub Pages in repository settings:"
print_status "   - Go to Settings > Pages"
print_status "   - Select 'docs' folder as source"
print_status "   - Your site will be available at: https://<username>.github.io/<repo-name>"
echo ""
GH_EOF

    chmod +x "${script_path}"
    print_success "Created deploy-github-pages.sh script"
}

create_deployment_info() {
    local info_path="${PROJECT_ROOT}/deployment-info.md"
    
    cat > "${info_path}" << DEPLOYINFO_EOF
# Idea Weaver Deployment Information

## Deployment Date
$(date)

## Environment Variables (Optional)
- REACT_APP_API_URL: Your deployed application URL
- REACT_APP_VERSION: Application version
- REACT_APP_GA_ID: Google Analytics ID
- REACT_APP_SENTRY_DSN: Sentry error tracking DSN

## Features Deployed
- ✅ Idea Management
- ✅ Mind Map Visualization
- ✅ List and Grid Views
- ✅ Search and Filtering
- ✅ Local Storage Persistence
- ✅ Offline Functionality
- ✅ Service Worker
- ✅ Material-UI Components
- ✅ Responsive Design

## Deployment Options

### Option 1: Vercel (Current)
- ✅ Deployed to Vercel
- ✅ Automatic deployments from Git
- ✅ Custom domain support
- ✅ HTTPS enabled

### Option 2: GitHub Pages
- Run \`./deploy-github-pages.sh\`
- Push docs folder to GitHub
- Enable GitHub Pages in repository settings
- Free hosting with custom domain support

### Option 3: Netlify
- Drag and drop build folder to Netlify
- Automatic deployments from Git
- Form handling and serverless functions

## Post-Deployment Checklist
- [ ] Test idea creation and editing
- [ ] Test mind map visualization
- [ ] Test search and filtering
- [ ] Test offline functionality
- [ ] Verify responsive design
- [ ] Set up monitoring and analytics

## Monitoring
- Check Vercel dashboard for deployment status
- Monitor user engagement
- Set up uptime monitoring
- Configure error tracking (Sentry)
- Monitor performance metrics

## Support
- Check logs in Vercel dashboard
- Review user interactions
- Monitor local storage usage
- Check service worker functionality
DEPLOYINFO_EOF

    print_success "Created deployment-info.md"
}

handle_post_deployment() {
    print_status "Post-deployment setup..."
    
    create_github_pages_script
    create_deployment_info
    
    print_success "✅ Deployment complete!"
    print_status "Next steps:"
    print_status "1. Test your deployed application"
    print_status "2. Set up monitoring and analytics"
    print_status "3. Configure custom domain if needed"
    print_status "4. Consider GitHub Pages as alternative deployment"
}

# ============================================================================
# Error Handling
# ============================================================================

cleanup_on_error() {
    local exit_code=$?
    
    if [[ ${exit_code} -ne 0 ]]; then
        echo ""
        print_error "Deployment failed with exit code ${exit_code}!"
        print_error "Please check the errors above and try again."
    fi
    
    exit ${exit_code}
}

# Set trap for error handling
trap cleanup_on_error EXIT

# ============================================================================
# Argument Parsing
# ============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --local)
                LOCAL_MODE=true
                shift
                ;;
            --help|-h)
                show_usage
                exit ${EXIT_SUCCESS}
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit ${EXIT_ERROR}
                ;;
        esac
    done
}

# ============================================================================
# Main Deployment Flow
# ============================================================================

main() {
    parse_arguments "$@"
    
    validate_project_root
    
    print_header "🚀 Idea Weaver Deployment"
    
    # Step 1: Environment Setup
    setup_environment
    
    # Step 2: Install Dependencies
    install_dependencies
    
    # Step 3: Run Tests
    run_tests
    
    # Step 4: Build Project
    build_project
    
    # Step 5: Deploy to Vercel or Local Testing
    if [[ "${LOCAL_MODE}" == "true" ]]; then
        show_local_testing_info
        print_header "✅ Local Build Complete!"
    else
        deploy_to_vercel
        
        # Step 6: Post-deployment setup
        handle_post_deployment
        
        print_header "🎉 Idea Weaver is live!"
    fi
    
    exit ${EXIT_SUCCESS}
}

# Run main function
main "$@"
