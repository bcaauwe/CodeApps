-- Create the Reviews table for the CodeApps-Template demo
-- Execute this script in your Azure SQL Database to create the table and sample data

-- Create the dbo.Reviews table
CREATE TABLE [dbo].[Reviews](
	[reviewId] [uniqueidentifier] NOT NULL,
	[movieId] [nvarchar](50) NOT NULL,
	[rating] [int] NOT NULL,
	[review] [nvarchar](max) NULL,
	[reviewerId] [nvarchar](100) NOT NULL,
	[reviewDate] [date] NULL,
 CONSTRAINT [PK_Reviews] PRIMARY KEY CLUSTERED 
(
	[reviewId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [CK_Review_Rating_Range] CHECK  (([rating]>=(1) AND [rating]<=(5)))
GO

ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [CK_Review_Rating_Range]
GO

-- REPLACE <YOURDOMAIN> with your Azure Tenant domain (e.g. M365x123456.onmicrosoft.com)
-- Insert sample data
INSERT INTO dbo.Reviews (reviewId, movieId, rating, review, reviewerId, reviewDate)
VALUES 
    (NEWID(), '24428', 3, 'Seriously guys. Its a great action movie, but this should not be in the top 250 list.

The action was great.

The story-line, though, was not consistent with the comic books, was decent.

The special effects were great, as expected.

The characters were believable.

On and on, it was an acceptably average movie. Worth spending money.

Watching it in theatres in 3D was a real treat! BUT, No way was it memorable or noteworthy or groundbreaking. It certainly does not deserve to be in top 250 list and be rated above 3 because its just an average movie.', 'AdeleV@YOURDOMAIN.OnMicrosoft.com', '2012-05-17'),
    (NEWID(), '24428', 5, 'Avengers Assemble ("The Avengers") is a truly enjoyable superhero film that lives up to its hype and creates a story that allows for four of the greatest superheroes to connect in this mega-blockbuster extravaganza. Joss Whedon has created one of the most action-packed Marvel films to have graced the screen, full of humour, thrills and a great cast of characters, all of which impel this visual effects-driven spectacle. Whilst I had the great opportunity to watch this epic in the cinema in 3D, the film is equally as stunning on an average television set, with the final battle between the Avengers and Loki''s army being one of the most spectacular scenes in a superhero movie. An impressive and remarkable fantastical superhero flick from Whedon.', 'DiegoS@<YOURDOMAIN>.OnMicrosoft.com', '2014-07-11'),
    (NEWID(), '24428', 5, 'This is one of the very few times i have walked out of a theater with a feeling of "wow".', 'NestorW@<YOURDOMAIN>.OnMicrosoft.com', '2019-12-21');
