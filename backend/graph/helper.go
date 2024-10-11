package graph

import (
	sqlmodel "video-to-article/backend/core/model"
	"video-to-article/backend/graph/model"
)

func convertToGraphQLArticle(a *sqlmodel.Article) *model.Article {
	return &model.Article{
		ID:        a.ID,
		VideoName: a.VideoName,
		Content:   a.Content,
		Title:     a.Title,
	}
}
