import { Construct } from "constructs";
import { App, Chart, ChartProps } from "cdk8s";

// imported constructs
import { KubeDeployment, KubeService, IntOrString } from "./imports/k8s";

export class SensitiveReadContainerChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    const label = { app: "dvldb-sensitive-read-container" };

    new KubeService(this, "service", {
      spec: {
        type: "LoadBalancer",
        ports: [{ port: 80, targetPort: IntOrString.fromNumber(8080) }],
        selector: label,
      },
    });

    new KubeDeployment(this, "deployment", {
      spec: {
        replicas: 2,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx:latest",
                ports: [{ containerPort: 8080 }],
                command: ["cat"],
                args: ["/etc/shadow"]
              },
            ],
          },
        },
      },
    });
  }
}

const app = new App();
new SensitiveReadContainerChart(app, "dvldb-sensitive-read-container");
app.synth();
