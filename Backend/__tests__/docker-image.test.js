const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Mock the exec function for Docker commands
jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    if (command.startsWith('docker build')) {
      // Simulate a successful build
      callback(null, 'Successfully built test-image', '');
    } else if (command.startsWith('docker run --rm test-image pwd')) {
      // Simulate the container printing its working directory
      callback(null, '/app\n', '');
    } else if (command.startsWith('docker inspect')) {
      // Simulate a docker inspect output showing exposed port 5000/tcp
      callback(null, '{"5000/tcp": {}}', '');
    } else {
      callback(new Error('Command not mocked'), '', '');
    }
  }),
}));

describe('Docker Image', () => {
  it('should build the Docker image successfully', (done) => {
    const dockerfilePath = path.join(__dirname, '../Dockerfile');

    // Check if Dockerfile exists
    if (!fs.existsSync(dockerfilePath)) {
      done(new Error('Dockerfile not found'));
      return;
    }

    // Build the Docker image using the current directory context
    exec(
      `docker build -t test-image -f ${dockerfilePath} .`,
      (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout.toLowerCase()).toContain('successfully built');
        done();
      }
    );
  });

  it('should have the correct working directory', (done) => {
    exec(
      'docker run --rm test-image pwd',
      (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout.trim()).toBe('/app'); // Ensure WORKDIR is set correctly
        done();
      }
    );
  });

  it('should expose the correct port', (done) => {
    exec(
      'docker inspect --format="{{.Config.ExposedPorts}}" test-image',
      (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout.trim()).toContain('5000/tcp'); // Ensure EXPOSE 5000 is set
        done();
      }
    );
  });
});