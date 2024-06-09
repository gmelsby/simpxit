import os
from supabase import create_client, Client
from dotenv import load_dotenv #type: ignore
import requests #type: ignore
from PIL import Image #type: ignore
from pathlib import Path

load_dotenv()

# connect to supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)



test_card_info = {
    'key': 'S12E20',
    'episode_number': 20,
    'season_number': 12,
    'title': 'Children of a Lesser Clod',
    'director': 'Mike Polcino',
    'writer': 'Al Jean',
    'original_air_date': '13-May-01',
    'timestamp': 913996,
    'subtitles': ["( grunts )", "YEAH, THEY'RE NOT GREAT."]
}

def get_random_card():
    season = 1
    if season < 1:
        pass

def download_image(key, timestamp) -> str:
    """
    Downloads the image from frinkiac and saves the image as a webp. Returns the filename of the saved image
    """ 
    # saves jpg image in temp folder
    res = requests.get(f'https://frinkiac.com/img/{key}/{timestamp}.jpg')
    filename = f'{key}_{timestamp}'
    temp_dir = 'images_temp'
    with open(f'{temp_dir}/{filename}.jpg', 'wb') as file:
        file.write(res.content)

    # converts jpg image to webp
    with Image.open(f'{temp_dir}/{filename}.jpg') as image:
        image = image.convert()
        image.save(f'images/{filename}.webp', 'webp')
    
    # cleans up old file
    Path.unlink(f'{temp_dir}/{filename}.jpg')



    return f'{filename}.webp'


def add_card_to_database(card_info) -> bool:
    """
    Adds the card to the card table and creates a corresponding episode in episode table if needed
    """

    # gets episode id if episode exists in database
    episode_data, _ = (supabase.table('episode')
                       .select('id')
                       .eq('key', card_info['key'])
                       .execute())

    # if episode does not exist, add it to the database
    if len(episode_data[1]):
        print(f'Episode {card_info['key']} already exists')

    else:
        print(f'Creating episode {card_info['key']}')
        episode_data, _ = (supabase.table('episode')
            .insert({
                'key': card_info['key'],
                'episode_number': card_info['episode_number'],
                'season_number': card_info['season_number'],
                'title': card_info['title'],
                'director': card_info['director'],
                'writer': card_info['writer'],
                'airdate': card_info['original_air_date'],
            })
            .execute())

    episode_id = episode_data[1][0]['id']


    # checks if card with matching episode and timestamp exists in database
    card_data, _ = (supabase.table('card')
                        .select('id')
                        .eq('episode_id', episode_id)
                        .eq('timestamp', card_info['timestamp'])
                        .execute())


    # exits early if card with same episode and timestamp exists
    if len(card_data[1]):
        print('Card already exists!')
        return False

    # downloads image
    card_info['filename'] = download_image(card_info['key'], card_info['timestamp'])
    print(f'Downloaded image {card_info['filename']}')

    card_data, _ = (supabase.table('card')
                    .insert({
                        'timestamp': card_info['timestamp'],
                        'subtitles': card_info['subtitles'],
                        'locator': f'{card_info['filename']}',
                        'frinkiac_link': f'https://frinkiac.com/caption/{card_info['key']}/{card_info['timestamp']}',
                        'episode_id': episode_id,
                    })
                    .execute())
    print('Put new card in database')
    return True


def main():
    add_card_to_database(test_card_info)

if __name__ == "__main__":
    main()
