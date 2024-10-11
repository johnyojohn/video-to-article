package article

import (
	// import standard libraries
	"context"
	"errors"
	"fmt"
	"net/url"
	"path"
	"strings"
	"time"

	"video-to-article/backend/core/model"

	"cloud.google.com/go/vertexai/genai"
)

//TODO: CACHE THE TRANSCRIPTION AND MAIN ARTICLE AND THE VIDEO STUFF

func GenerateArticle(videoURL string) (*model.Article, error) {
	transcription, err := GenerateTranscriptionWithTimestamps(videoURL)
	if err != nil {
		return nil, err
	}

	articleMain, err := GenerateArticleMain(transcription)
	if err != nil {
		return nil, err
	}

	articleTitle, err := GenerateArticleTitle(articleMain)
	if err != nil {
		return nil, err
	}

	// Parse the URL
	parsedURL, err := url.Parse(videoURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse video URL: %w", err)
	}

	// Extract just the filename from the path
	videoName := path.Base(parsedURL.Path)

	article := &model.Article{
		ID:        fmt.Sprintf("article_%d", time.Now().UnixNano()),
		VideoName: videoName,
		Content:   articleMain,
		Title:     articleTitle,
		CreatedAt: time.Now(),
	}

	return article, nil
}

func GenerateArticleTitle(articleMain string) (string, error) {
	// Split the articleMain into lines
	lines := strings.Split(articleMain, "\n")

	// Look for the first line starting with '#'
	for _, line := range lines {
		if strings.HasPrefix(line, "#") {
			// Remove the '#' characters and trim spaces
			title := strings.TrimLeft(line, "# ")
			return strings.TrimSpace(title), nil
		}
	}

	// If no title found, return an error
	return "", errors.New("no title found in the article")
}

func GenerateArticleMain(transcription string) (string, error) {
	ctx := context.Background()
	projectID := "test-438001"
	location := "us-central1"
	modelName := "gemini-1.5-pro-002"

	client, err := genai.NewClient(ctx, projectID, location)
	if err != nil {
		return "", fmt.Errorf("unable to create client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel(modelName)
	model.GenerationConfig.ResponseMIMEType = "text/plain"

	fmt.Println(transcription)

	res, err := model.GenerateContent(ctx, genai.Text(fmt.Sprintf(`
Another LLM model was given an educational video and was asked to generate the
timestamp, transcription, and detailed visual descriptions for each second of the video
using this JSON schema:
Content = {'timestamp': string, 'transcription': string, 'visualDescription': string}
Return: Array<Content>
Note that the timestamp is in the format of HH:MM:SS.

Here is the transcription:

%s

Your task is to generate a well-structured article based on the transcription using markdown. 
The article should have a title and a table of contents. The title should be formatted as a markdown header.
The table of contents should be formatted as a markdown list.
Each section in the table of contents should have a title and a timestamp. The timestamp of each section is the start time of the corresponding content in the video.
The table of contents do not necessarily have to be in the same order as the content in the video.
You should include the timestamp of each section at the start of the section.
You are encouraged to embed frames from the video as images in the article when they are relevant to nearby content. Whenever
you want to embed a frame from the video, you should do it by using the following syntax:
<!---<img timestamp="HH:MM:SS" width="300" height="200" />-->
Note that this is a comment in markdown and will be accounted for separately. 
Return only the markdown.
`, transcription)))

	if err != nil {
		return "", fmt.Errorf("unable to generate contents: %w", err)
	}

	if len(res.Candidates) == 0 ||
		len(res.Candidates[0].Content.Parts) == 0 {
		return "", errors.New("empty response from model")
	}

	return fmt.Sprintf("%v", res.Candidates[0].Content.Parts[0]), nil
}

func GenerateTranscriptionWithTimestamps(videoURL string) (string, error) {
	ctx := context.Background()
	projectID := "test-438001"
	location := "us-central1"
	modelName := "gemini-1.5-pro-002"

	client, err := genai.NewClient(ctx, projectID, location)
	if err != nil {
		return "", fmt.Errorf("unable to create client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel(modelName)
	model.GenerationConfig.ResponseMIMEType = "application/json"
	model.GenerationConfig.ResponseSchema = &genai.Schema{
		Type: genai.TypeArray,
		Items: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"timestamp": {
					Type: genai.TypeString, // HH:MM:SS
				},
				"transcription": {
					Type: genai.TypeString,
				},
				"visualDescription": {
					Type: genai.TypeString,
				},
			},
		},
	}

	// Given a video file URL, prepare video file as genai.Part
	part := genai.FileData{
		MIMEType: "video/mp4",
		FileURI:  videoURL,
	}

	res, err := model.GenerateContent(ctx, part, genai.Text(`
	    You are given an educational video.
		For each second of the video, provide the timestamp, transcription, and detailed visual descriptions using 
		this JSON schema. Note that the timestamp should be in the format of HH:MM:SS.
        `))

	if err != nil {
		return "", fmt.Errorf("unable to generate contents: %w", err)
	}

	if len(res.Candidates) == 0 ||
		len(res.Candidates[0].Content.Parts) == 0 {
		return "", errors.New("empty response from model")
	}

	return fmt.Sprintf("%v", res.Candidates[0].Content.Parts[0]), nil
}
