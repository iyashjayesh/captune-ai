# Captune AI - Free Subtitle Generator

⭐ Drop a star if you like the project!

A powerful web application that generates subtitles for videos using AI. Visit the live demo at [free-subtitle-ai.yashchauhan.dev](https://free-subtitle-ai.yashchauhan.dev)

## Demo Video
Watch our demo video on YouTube:

<div align="center">
  <a href="https://youtu.be/ltycu8GZ7pw">
    <img src="https://img.youtube.com/vi/ltycu8GZ7pw/0.jpg" alt="Captune AI Demo" width="600">
  </a>
</div>

Captune AI leverages open ai whisper model to accurately transcribe spoken words into text, making it easier for users to create subtitles for their videos. Whether you're a content creator, educator, or business professional, this tool simplifies the process of adding subtitles, enhancing accessibility and engagement for your audience. With support for multiple languages and customizable subtitle options, Captune AI is designed to meet diverse user needs.

All processing is done on the client side, so you can rest assured that your data is secure. 

## Features

- 🎥 Video upload and processing
- 🤖 AI-powered subtitle generation
- 📝 Subtitle editing and customization
- 🌐 Multi-language support
- 🔒 User authentication
- 📱 Responsive design
- 🎨 Modern UI with dark/light mode

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Video Processing**: FFmpeg
- **Form Handling**: React Hook Form with Zod validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB 
- FFmpeg WebAssembly (WASM) (for video processing)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/iyashjayesh/captune-ai.git
   cd captune-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_uri
   
   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Google Authentication
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   
   # Hugging Face API
   HF_API_KEY=your_huggingface_api_key
   ```

   To set up Google Authentication:
   1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select an existing one
   3. Enable the Google+ API
   4. Go to Credentials → Create Credentials → OAuth Client ID
   5. Set up the OAuth consent screen
   6. Add authorized redirect URIs:
      - `http://localhost:3000/api/auth/callback/google` (for development)
      - `https://free-subtitle-ai.yashchauhan.dev/api/auth/callback/google` (for production)
   7. Copy the Client ID and Client Secret to your `.env` file

   To set up Hugging Face API:
   1. Create an account on [Hugging Face](https://huggingface.co/)
   2. Go to your profile settings → Access Tokens
   3. Create a new token with read access
   4. Copy the token to your `.env` file
   
   Note: You can also run the model locally if you prefer. In that case, you'll need to set up the model files and update the configuration accordingly.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Project Structure

```
captune-ai/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions and configurations
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── ...config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

---

Made with ❤️ by [Yash Chauhan](https://yashchauhan.dev) ([@iyashjayesh](https://github.com/iyashjayesh))

## Architecture Diagrams

Below are the architecture diagrams for the Captune AI application:

![High Level Architecture](./High-Level%20System%20Architecture.png)
![Low Level Architecture](./Low-Level%20Component%20Architecture.png)
