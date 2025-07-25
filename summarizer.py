


import sys
from transformers import pipeline, PegasusTokenizer

# Initialize the summarization pipeline with your model and tokenizer paths
model_path = 'pegasus_model-20241227T175138Z-002\pegasus_model\pegasus-samsum-model'  # Replace with your model path if necessary
tokenizer_path = 'pegasus_model-20241227T175138Z-002\pegasus_model\\tokenizer'  # Replace with your tokenizer path if necessary

# Initialize the summarization pipeline
pipe = pipeline("summarization", model=model_path, tokenizer=tokenizer_path)

gen_kwargs = {
    "length_penalty": 0.8,      # Set a length penalty
    "num_beams": 8,             # Set number of beams for beam search
    "max_length": 56,          # Set the max length for the summary
    "min_length": 50,           # Set the minimum length for the summary
    "early_stopping": True      # Enable early stopping during generation
}

# Function to summarize your custom text
def summarize_custom_text(custom_text):
    # Generate and print the model's summary
    try:
        model_summary = pipe(custom_text, **gen_kwargs)[0]["summary_text"]
        print("\nModel Summary:")
        print(model_summary)
    except Exception as e:
        print(f"Error during summarization: {e}")

# Read input text from stdin (sent from the frontend or from command line)
input_text = sys.stdin.read().strip()

# Call the function with the input text
summarize_custom_text(input_text)

