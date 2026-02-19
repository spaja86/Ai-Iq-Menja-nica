# Frontend Build Directory

This directory should contain the production build of your frontend application.

## Development

Build your frontend application and place the output files here.

Example for React:
```bash
npm run build
cp -r build/* ../Ai-Iq-Menja-nica/frontend/build/
```

Example for Vue:
```bash
npm run build
cp -r dist/* ../Ai-Iq-Menja-nica/frontend/build/
```

## Production

The Nginx configuration in `nginx/nginx.prod.conf` serves files from this directory.

The placeholder `index.html` file will be replaced with your actual frontend build.
