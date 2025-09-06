import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

const aiTools = [
  {
    name: 'Tool Name 1',
    description: 'A brief description of what this amazing AI tool does.',
    link: '#',
  },
  {
    name: 'Tool Name 2',
    description: 'Another revolutionary tool that changes everything.',
    link: '#',
  },
  {
    name: 'Tool Name 3',
    description: 'This one is powered by quantum hamsters.',
    link: '#',
  },
  {
    name: 'Tool Name 4',
    description: 'You will not believe what this tool can do for your workflow.',
    link: '#',
  },
];

export default function AiTools() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">AI Tools Discovery</h1>
      <p className="text-muted-foreground mb-8">
        A curated list of AI tools from around the worldwide to enhance your productivity and creativity.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {tool.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{tool.description}</p>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Visit Tool &rarr;
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
