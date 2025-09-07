
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const toolCategories = [
  {
    category: 'AI Chatbots & Assistants',
    tools: [
      { name: 'AskCodi', link: 'https://www.askcodi.com/', description: 'AI code assistant for developers.' },
      { name: 'ChatGPT', link: 'https://chat.openai.com/', description: 'Conversational AI for a wide range of tasks.' },
      { name: 'Character.AI', link: 'https://character.ai/', description: 'Create and talk to AI characters.' },
      { name: 'Claude', link: 'https://claude.ai/', description: 'A next-generation AI assistant for your tasks, no matter the scale.' },
      { name: 'DeepSeek', link: 'https://chat.deepseek.com/', description: 'A powerful AI chatbot for search and discovery.' },
      { name: 'Gemini', link: 'https://gemini.google.com/app', description: 'Google\'s creative and helpful AI collaborator.' },
      { name: 'Grok', link: 'https://grok.x.ai/', description: 'An AI by xAI, designed to answer almost anything.' },
      { name: 'Meta AI', link: 'https://meta.ai/', description: 'Meta\'s advanced conversational AI.' },
      { name: 'MS Copilot', link: 'https://copilot.microsoft.com/', description: 'Microsoft\'s everyday AI companion.' },
      { name: 'Perplexity', link: 'https://www.perplexity.ai/', description: 'An answer engine that delivers accurate answers to complex questions.' },
      { name: 'Poe by Quora', link: 'https://poe.com/', description: 'Platform for accessing various AI chatbots.' },
      { name: 'Replika', link: 'https://replika.com/', description: 'The AI companion who cares.' },
    ],
  },
  {
    category: 'AI Image, Video & Design',
    tools: [
        { name: 'Adobe Firefly', link: 'https://www.adobe.com/products/firefly.html', description: 'Generative AI for creative expression.' },
        { name: 'AutoDraw', link: 'https://www.autodraw.com/', description: 'Fast drawing for everyone with the help of AI.' },
        { name: 'Canva', link: 'https://www.canva.com/', description: 'Online design tool with AI-powered features.' },
        { name: 'DALL-E', link: 'https://openai.com/dall-e-3', description: 'Create realistic images and art from a description in natural language.' },
        { name: 'Deepbrain AI', link: 'https://www.deepbrain.io/', description: 'AI video generation platform with virtual humans.' },
        { name: 'Descript', link: 'https://www.descript.com/', description: 'All-in-one audio and video editor with AI tools.' },
        { name: 'Eightify', link: 'https://eightify.app/', description: 'Summarize YouTube videos with AI.' },
        { name: 'FLUX 1', link: 'https://bfl.ai/', description: 'Create stunning visuals with this AI image tool.' },
        { name: 'Gling', link: 'https://gling.ai/', description: 'AI tool that automatically cuts silences and bad takes from videos.' },
        { name: 'HeyGen', link: 'https://www.heygen.com/', description: 'AI video platform for creating engaging business videos.' },
        { name: 'Ideogram', link: 'https://ideogram.ai/', description: 'AI tool that makes creating images with text easy.' },
        { name: 'Kaedim', link: 'https://www.kaedim3d.com/', description: 'Automatically convert 2D images to 3D models.' },
        { name: 'Khroma', link: 'http://khroma.co/', description: 'AI color tool for designers.' },
        { name: 'Krea AI', link: 'https://www.krea.ai/', description: 'AI-powered creative suite for generating images and videos.' },
        { name: 'Leonardo.Ai', link: 'https://leonardo.ai/', description: 'Generate production-quality assets for your creative projects.' },
        { name: 'LTX Studio', link: 'https://ltx.studio/', description: 'An AI-powered filmmaker for creating video content.' },
        { name: 'Luma AI', link: 'https://lumalabs.ai/', description: 'Create incredible lifelike 3D with your phone.' },
        { name: 'Lumen5', link: 'https://lumen5.com/', description: 'AI-powered video creation platform.' },
        { name: 'Midjourney', link: 'https://www.midjourney.com/', description: 'An independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species.' },
        { name: 'Nova AI', link: 'https://nova.ai/', description: 'Online video editing tools.' },
        { name: 'Opus Clip', link: 'https://www.opus.pro/', description: 'A generative AI video tool that repurposes long videos into shorts in one click.' },
        { name: 'Pika', link: 'https://pika.art/', description: 'An idea-to-video platform that brings your creativity to motion.' },
        { name: 'Runway', link: 'https://runwayml.com/', description: 'AI video editing and generation tools for creators.' },
        { name: 'Spline AI', link: 'https://spline.design/ai', description: 'Create 3D objects, animations, and textures with AI prompts.' },
        { name: 'Stable Diffusion', link: 'https://stability.ai/stable-diffusion', description: 'Open-source image generation model.' },
        { name: 'Synthesia', link: 'https://www.synthesia.io/', description: 'AI video creation platform with AI avatars.' },
        { name: 'Veed.io', link: 'https://www.veed.io/', description: 'Online video editor with a suite of AI tools.' },
        { name: 'Visme', link: 'https://www.visme.co/', description: 'All-in-one content creation tool with AI features.' },
    ],
  },
  {
    category: 'AI Writing & Content Creation',
    tools: [
      { name: 'Copy.ai', link: 'https://www.copy.ai/', description: 'AI-powered copywriter for marketing and sales.' },
      { name: 'Grammarly', link: 'https://www.grammarly.com/', description: 'AI-powered writing assistant.' },
      { name: 'Jasper', link: 'https://www.jasper.ai/', description: 'AI content platform for businesses.' },
      { name: 'Notion AI', link: 'https://www.notion.so/product/ai', description: 'AI features integrated into the Notion workspace.' },
      { name: 'Rytr', link: 'https://rytr.me/', description: 'An AI writing assistant that helps you create high-quality content.' },
      { name: 'Sudowrite', link: 'https://sudowrite.com/', description: 'Your AI partner for creative writing.' },
      { name: 'Writesonic', link: 'https://writesonic.com/', description: 'AI writer for creating SEO-friendly content.' },
    ],
  },
  {
    category: 'AI Presentations & Documents',
    tools: [
      { name: 'Beautiful.AI', link: 'https://www.beautiful.ai/', description: 'AI presentation maker for stunning slides.' },
      { name: 'Pitch', link: 'https://pitch.com/', description: 'Collaborative presentation software with AI features.' },
      { name: 'Plus', link: 'https://www.plusdocs.com/', description: 'Create Google Slides presentations with AI.' },
      { name: 'PopAi', link: 'https://www.popai.pro/', description: 'AI-powered reading and writing assistant.' },
      { name: 'Presentation.AI', link: 'https://presentation.ai/', description: 'Create presentations in seconds with AI.' },
      { name: 'Slidesgo', link: 'https://slidesgo.com/ai-presentations', description: 'AI presentation maker from the creators of Freepik.' },
      { name: 'Tome', link: 'https://tome.app/', description: 'The AI-powered storytelling format for work and ideas.' },
    ],
  },
  {
    category: 'AI Website & Landing Page Builders',
    tools: [
      { name: 'Durable', link: 'https://durable.co', description: 'Generates a complete business website with a CRM in under a minute.' },
      { name: 'Hocoos', link: 'https://hocoos.com', description: 'Uses a guided, question-based process to create a tailored website.' },
      { name: 'Lovable', link: 'https://lovable.ai', description: 'A prompt-based builder focused on creating professional, multi-page websites quickly.' },
      { name: 'Hostinger AI Website Builder', link: 'https://www.hostinger.com/website-builder', description: 'An affordable, all-in-one package that generates a full site from a description.' },
      { name: 'GoDaddy AI Website Builder', link: 'https://www.godaddy.com/websites/website-builder', description: 'Generates an industry-specific website integrated into GoDaddy\'s ecosystem.' },
      { name: 'Wix ADI (Artificial Design Intelligence)', link: 'https://www.wix.com/adi-website-builder', description: 'Builds a custom Wix website based on your answers to a series of questions.' },
      { name: 'Pineapple AI', link: 'https://pineapplebuilder.com', description: 'A fast and simple builder for creating clean, modern websites from a prompt.' },
      { name: 'B12', link: 'https://www.b12.io', description: 'A hybrid service that uses AI to draft a website, which is then refined by human design experts.' },
      { name: 'Gamma.app', link: 'https://gamma.app', description: 'Creates beautiful, interactive one-page websites and landing pages from a single prompt.' },
      { name: 'Rollout', link: 'https://www.rollout.com', description: 'An AI-driven builder with a strong focus on creating visually stunning websites.' },
      { name: 'Siter.io', link: 'https://siter.io', description: 'An extremely fast AI builder known for generating clean, minimalist websites from a text prompt.' },
      { name: 'Pagemaker', link: 'https://www.pagemaker.io', description: 'A mobile-first AI landing page builder for high-converting e-commerce campaigns.' },
    ],
  },
  {
    category: 'AI UI, Web & Full-Stack App Builders',
    tools: [
      { name: '10Web AI Builder', link: 'https://10web.io', description: 'Creates or replicates any website on the WordPress platform using AI.' },
      { name: 'Framer AI', link: 'https://www.framer.com/ai', description: 'A professional design tool that generates complete, interactive websites from a text prompt.' },
      { name: 'Base44 (Acquired by Wix)', link: 'https://www.base44.com', description: 'An AI platform that builds full-stack web applications from a text description.' },
      { name: 'Capacity', link: 'https://www.capacity.com', description: 'A no-code tool that generates complete, working web applications from an idea.' },
      { name: 'Mocha', link: 'https://www.mocha.so', description: 'A prompt-based, no-code builder for quickly turning ideas into simple web applications.' },
      { name: 'Debuild', link: 'https://debuild.app', description: 'A low-code AI tool that generates React components and SQL logic to rapidly build web apps.' },
      { name: 'Relate', link: 'https://www.relate.so', description: 'An AI tool that generates data-driven web applications like internal tools and dashboards.' },
      { name: 'Yakk.ai', link: 'https://yakk.ai', description: 'An AI platform for creating embeddable micro-apps and interactive widgets.' },
    ],
  },
  {
    category: 'AI Mobile App Builders',
    tools: [
      { name: 'vibecode', link: 'https://www.vibecode.com', description: 'A dedicated platform for creating native mobile apps, primarily for iOS, directly from a text prompt.' },
      { name: 'Create.xyz', link: 'https://www.create.xyz', description: 'A low-code platform that uses AI to build web apps, mobile apps, and backend services.' },
      { name: 'FlutterFlow AI Gen', link: 'https://flutterflow.io', description: 'An AI feature that generates pages and layouts for native iOS and Android apps.' },
    ],
  },
  {
    category: 'AI Design & Developer Tools',
    tools: [
      { name: 'V0', link: 'https://v0.dev', description: 'A tool by Vercel for developers that generates React UI component code from a text prompt.' },
      { name: 'Make-Real.ai', link: 'https://makereal.tldraw.com', description: 'An AI tool that converts drawings, sketches, and wireframes into functional code.' },
      { name: 'Uizard (Autodesigner)', link: 'https://uizard.io/autodesigner', description: 'An AI-powered feature that generates multi-screen mockups and UI kits for apps.' },
      { name: 'Galileo AI', link: 'https://www.usegalileo.ai', description: 'A "text-to-UI" tool that generates high-fidelity, editable designs in Figma from a prompt.' },
      { name: 'Form.new', link: 'https://www.form.new', description: 'An AI builder that creates complex forms, surveys, and quizzes just by describing your goal.' },
      { name: 'Magician (for Figma)', link: 'https://magician.design', description: 'An AI design assistant plugin for Figma that generates icons, images, and copy.' },
      { name: 'Anima App', link: 'https://www.animaapp.com', description: 'A tool that converts designs from Figma or Adobe XD into developer-ready code.' },
    ],
  },
  {
    category: 'AI Music & Audio',
    tools: [
      { name: 'Adobe Podcast', link: 'https://podcast.adobe.com/enhance', description: 'AI-powered audio recording and editing, all on the web.' },
      { name: 'AIVA', link: 'https://www.aiva.ai/', description: 'The AI generating emotional soundtrack music.' },
      { name: 'ElevenLabs', link: 'https://elevenlabs.io/', description: 'AI voice generator for text-to-speech and voice cloning.' },
      { name: 'LALAL.AI', link: 'https://www.lalal.ai/', description: 'High-quality stem splitting based on AI.' },
      { name: 'Suno', link: 'https://www.suno.ai/', description: 'AI music generator to create songs with lyrics and instruments.' },
      { name: 'Udio', link: 'https://www.udio.com/', description: 'Make your own music in an instant.' },
    ],
  },
  {
    category: 'AI Productivity & Automation',
    tools: [
      { name: 'Calendly', link: 'https://calendly.com/', description: 'Automated scheduling software.' },
      { name: 'ClickUp', link: 'https://clickup.com/', description: 'All-in-one productivity platform with AI.' },
      { name: 'Cognito', link: 'https://www.cognito.ai/', description: 'AI-powered process automation.' },
      { name: 'Integrately', link: 'https://integrately.com/', description: '1-click workflow automation.' },
      { name: 'Make', link: 'https://www.make.com/', description: 'Visual platform to design, build, and automate anything.' },
      { name: 'monday.com', link: 'https://monday.com/', description: 'Work OS with automation and AI features.' },
      { name: 'Motion', link: 'https://www.motion.ai/', description: 'AI-powered calendar and time management tool.' },
      { name: 'Mural', link: 'https://www.mural.co/', description: 'Visual collaboration platform with AI capabilities.' },
      { name: 'n8n', link: 'https://n8n.io/', description: 'Workflow automation for technical people.' },
      { name: 'Reclaim', link: 'https://reclaim.ai/', description: 'AI calendar for busy professionals.' },
      { name: 'SaneBox', link: 'https://www.sanebox.com/', description: 'AI for your email to prioritize what\'s important.' },
      { name: 'Shortwave', link: 'https://www.shortwave.com/', description: 'The AI email client.' },
      { name: 'Trevor AI', link: 'https://trevor.ai/', description: 'AI-powered task management and scheduling.' },
      { name: 'Wrike', link: 'https://www.wrike.com/', description: 'Work management platform with AI-powered features.' },
      { name: 'Zapier', link: 'https://zapier.com/', description: 'Automation platform that connects your apps and services.' },
    ],
  },
  {
    category: 'AI Data, Coding & Research',
    tools: [
      { name: 'Bricks', link: 'https://www.bricks.ai/', description: 'AI-powered data analysis and visualization.' },
      { name: 'Cogram', link: 'https://www.cogram.com/', description: 'AI for data analysis and reporting.' },
      { name: 'Consensus', link: 'https://consensus.app/', description: 'AI search engine for research papers.' },
      { name: 'Cursor', link: 'https://cursor.com/', description: 'The AI-first code editor.' },
      { name: 'Deckalit', link: 'https://deckalite.com/', description: 'AI-powered data analysis and visualization.' },
      { name: 'Elicit', link: 'https://elicit.org/', description: 'The AI Research Assistant.' },
      { name: 'Flourish', link: 'https://flourish.studio/', description: 'Data visualization and storytelling.' },
      { name: 'Formelous', link: 'https://formulate.app/', description: 'Turn spreadsheets into AI-powered tools.' },
      { name: 'GitHub Copilot', link: 'https://github.com/features/copilot', description: 'Your AI pair programmer.' },
      { name: 'Glide', link: 'https://www.glideapps.com/', description: 'Create apps from spreadsheets with AI.' },
      { name: 'Juice', link: 'https://www.juice.ai/', description: 'AI-powered data cleaning and preparation.' },
      { name: 'Rose AI', link: 'https://rose.ai/', description: 'AI platform for data analysis and research.' },
      { name: 'Rows', link: 'https://rows.com/', description: 'The spreadsheet with superpowers, including AI.' },
      { name: 'SciSpace', link: 'https://typeset.io/', description: 'Your AI copilot for understanding research papers.' },
      { name: 'SheetAI', link: 'https://sheetai.app/', description: 'Use AI directly in Google Sheets.' },
      { name: 'Tableau', link: 'https://www.tableau.com/', description: 'Data visualization platform with AI capabilities.' },
    ],
  },
  {
    category: 'AI Meetings & Communication',
    tools: [
      { name: 'Avoma', link: 'https://www.avoma.com/', description: 'AI meeting assistant for revenue teams.' },
      { name: 'Equal Time', link: 'https://equaltime.io/', description: 'AI-powered meeting analytics.' },
      { name: 'Fathom', link: 'https://fathom.video/', description: 'AI meeting assistant that records, transcribes, and summarizes.' },
      { name: 'Fellow App', link: 'https://fellow.app/', description: 'Meeting management software with AI features.' },
      { name: 'Fireflies', link: 'https://fireflies.ai/', description: 'AI assistant for your meetings.' },
      { name: 'Krisp', link: 'https://krisp.ai/', description: 'AI-powered noise-cancelling app.' },
      { name: 'Otter', link: 'https://otter.ai/', description: 'AI-powered transcription and meeting notes.' },
    ],
  },
  {
    category: 'AI Health & Wellness',
    tools: [
      { name: 'Glass AI', link: 'https://glass.health/', description: 'AI for medical knowledge.' },
      { name: 'Whoop Coach', link: 'https://www.whoop.com/', description: 'AI-powered health and fitness coach.' },
    ],
  },
];

export default function AiTools() {
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('aiToolsDiscovery')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('aiToolsDescription')}
      </p>
      <Accordion type="multiple" className="w-full space-y-4">
        {toolCategories.map((categoryItem) => (
          <AccordionItem
            value={categoryItem.category}
            key={categoryItem.category}
            className="border-none"
          >
            <AccordionTrigger className="text-xl font-semibold bg-card/50 px-6 rounded-lg hover:no-underline hover:bg-card">
              {categoryItem.category}
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryItem.tools.map((tool, index) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        {tool.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-muted-foreground mb-4 flex-grow">{tool.description}</p>
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline mt-auto"
                      >
                        {t('visitTool')}
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
