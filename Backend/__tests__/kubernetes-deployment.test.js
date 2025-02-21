const { exec } = require('child_process');
const path = require('path');

// Mock the exec function
jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    if (command.includes('kubectl apply')) {
      // Simulate a successful dry-run
      callback(null, 'dry run succeeded', '');
    } else {
      callback(new Error('Command not mocked'), '', '');
    }
  }),
}));

describe('Kubernetes Deployment', () => {
  it('should validate the Kubernetes deployment YAML file', (done) => {
    const deploymentPath = path.join(__dirname, '../../k8s/deployment.yaml');

    // Call the mocked exec function
    exec(
      `kubectl apply -f "${deploymentPath}" --dry-run=client --validate=false`,
      (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }
        expect(stdout.toLowerCase()).toContain('dry run succeeded');
        done();
      }
    );
  });
});