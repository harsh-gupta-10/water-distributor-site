// Vercel Serverless Function for uploading images to GitHub
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { fileName, fileData, folder = 'products' } = req.body;

        // Validate required fields
        if (!fileName || !fileData) {
            return res.status(400).json({ error: 'fileName and fileData are required' });
        }

        // Get GitHub credentials from environment variables
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_REPO = process.env.GITHUB_REPO; // Format: "username/repo"
        const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

        if (!GITHUB_TOKEN || !GITHUB_REPO) {
            return res.status(500).json({ 
                error: 'Server configuration error. Please set GITHUB_TOKEN and GITHUB_REPO in Vercel environment variables.' 
            });
        }

        // Clean and validate filename
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `public/imgs/${folder}/${cleanFileName}`;

        // Remove data URL prefix if present (e.g., "data:image/png;base64,")
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;

        // Check if file already exists
        const checkUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
        const checkResponse = await fetch(checkUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        let sha = null;
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            sha = existingFile.sha;
        }

        // Upload to GitHub
        const uploadUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload product image: ${cleanFileName}`,
                content: base64Data,
                branch: GITHUB_BRANCH,
                ...(sha && { sha }), // Include SHA if file exists (for update)
            }),
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error('GitHub API Error:', errorData);
            return res.status(uploadResponse.status).json({ 
                error: `GitHub upload failed: ${errorData.message || 'Unknown error'}` 
            });
        }

        const result = await uploadResponse.json();

        // Return the public URL
        const publicUrl = `/imgs/${folder}/${cleanFileName}`;
        
        return res.status(200).json({ 
            success: true,
            url: publicUrl,
            message: 'Image uploaded successfully. Vercel will rebuild automatically.',
            githubUrl: result.content.html_url
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ 
            error: 'Upload failed',
            details: error.message 
        });
    }
}
