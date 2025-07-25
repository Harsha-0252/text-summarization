from transformers import pipeline, BartTokenizer, BartForConditionalGeneration

# Initialize the model and tokenizer paths
model_path = 'abstractive'  # Replace with your model path if necessary

# Initialize the tokenizer and model
tokenizer = BartTokenizer.from_pretrained(model_path)  # Use BART tokenizer
model = BartForConditionalGeneration.from_pretrained(model_path)  # Load BART model

# Initialize the summarization pipeline
summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)

def clean_text(text):
    """
    Remove invalid or non-UTF-8 characters from text.
    """
    return text.encode('utf-8', 'ignore').decode('utf-8')

def chunk_text(text, max_tokens=1024):
    """
    Split the text into chunks that are smaller than the model's token limit.
    """
    sentences = text.split('. ')
    chunks = []
    chunk = ''

    for sentence in sentences:
        if len(chunk.split()) + len(sentence.split()) <= max_tokens:
            chunk += sentence + '. '
        else:
            chunks.append(chunk.strip())
            chunk = sentence + '. '

    if chunk:
        chunks.append(chunk.strip())

    return chunks

def summarize_in_multiple_passes(text, summarizer, max_tokens=1024):
    """
    Summarize large text in multiple passes if necessary.
    """
    # Step 1: Chunk the large text into smaller pieces
    chunks = chunk_text(text, max_tokens)

    # Step 2: Summarize each chunk
    summaries = []
    for chunk in chunks:
        try:
            summaries.append(summarizer(chunk, max_length=max_tokens, min_length=10, truncation=True)[0]['summary_text'])
        except Exception as e:
            print(f"Error summarizing chunk: {e}")

    # Step 3: Combine the summaries into a single text
    combined_summary = ' '.join(summaries)

    # Step 4: If combined summary is still too large, repeat summarization
    while len(combined_summary.split()) > max_tokens:
        combined_summary = summarizer(combined_summary, max_length=max_tokens, min_length=10, truncation=True)[0]['summary_text']

    return combined_summary

def summarize_custom_text(custom_text):
    """
    Summarize the given custom text using the model.
    """
    try:
        # Clean the input text
        custom_text = clean_text(custom_text)
        summary = summarize_in_multiple_passes(custom_text, summarizer)
        print("\nModel Summary:")
        print(summary)
    except Exception as e:
        print(f"Error during summarization: {e}")

# Example usage
if __name__ == "__main__":
    import sys
    # Read input text from stdin (or replace with direct text for testing)
    input_text = sys.stdin.read().strip()

    # Call the summarization function
    summarize_custom_text(input_text)
