# Update system package lists
sudo apt-get update

# Install some pre-requisite packages
sudo apt-get --assume-yes --quiet install curl xvfb

# Start display server for Atom
/sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1024x768x16 +extension RANDR

# Download Atom build script
curl -s -O https://raw.githubusercontent.com/atom/ci/master/build-package.sh

# Make build script executable
chmod u+x build-package.sh

# Run package tests
./build-package.sh
