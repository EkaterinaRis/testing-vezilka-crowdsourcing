from db.utils import *

def iter_video_and_audio_with_transcription(conn, chunk_size=100):
    query = """
        select content.created_at,
            description,
            file_url,
            quality_score,
            topic,
            type,
            dialect.name as dialect,
            original_file_name,
            text
        from content
                join transcription
                    on content.id = transcription.content_id
                join dialect
                    on dialect.id=dialect_id;
    """

    for chunk in pd.read_sql(query, conn, chunksize=chunk_size):
        for row in chunk.itertuples(index=False):
            yield row


def iter_text_and_image_data(conn, chunk_size=100):
    query = """
        select content.*, dialect.name as dialect
        from content
        join dialect
            on dialect.id=dialect_id
        where type = 'TEXT' or type = 'IMAGE';
    """

    for chunk in pd.read_sql(query, conn, chunksize=chunk_size):
        for row in chunk.itertuples(index=False):
            yield row