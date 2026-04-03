import os

from flask import Flask, jsonify, request

app = Flask(__name__)

def stable_bucket(seed: str) -> int:
    hash_value = 0
    for character in seed:
        hash_value = ((hash_value << 5) - hash_value) + ord(character)
        hash_value &= 0xFFFFFFFF

    if hash_value & 0x80000000:
        hash_value = -((~hash_value + 1) & 0xFFFFFFFF)

    return abs(hash_value) % 100

@app.route('/test/<experiment_name>')
def run_test(experiment_name):
    """
    Enterprise A/B testing for critical UX decisions.
    
    Current experiment: Should "Hello World" end with "!" or "."?
    This experiment has been running for 6 months.
    Statistical significance has not yet been reached.
    """
    user_id = request.args.get('userId', 'anonymous-web')
    bucket = stable_bucket(f'{experiment_name}:{user_id}')
    variant = 'A' if bucket < 50 else 'B'
    punctuation = '!' if variant == 'A' else '.'
    style = 'excited' if variant == 'A' else 'enterprise'
    
    return jsonify({
        'experiment': experiment_name,
        'bucket': bucket,
        'punctuation': punctuation,
        'style': style,
        'variant': variant,
        'variantDescription': {
            'A': 'Hello World!  (excited)',
            'B': 'Hello World.  (professional)',
        }[variant],
        'sampleSize': 128,
        'requiredSampleSize': 10000,
        'statisticalSignificance': 'early-signal-only',
        'pValue': 0.42,
        'recommendation': 'Keep the experiment running while the architecture council debates punctuation governance.',
        'stakeholderMeetingsHeld': 14,
        'powerPointSlidesCreated': 87,
        'userId': user_id,
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', '8085')))
