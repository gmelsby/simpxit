import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv #type: ignore
from pathlib import Path

load_dotenv()

# connect to supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

folder_name = "./images/"

def main():
    if len(sys.argv) < 2:
        print('Please specify a source file as a command line argument', file=sys.stderr)
        return
    


    db_delete_count = 0
    initial_image_count = len(list(Path(folder_name).glob('*')))
    with open(sys.argv[1], 'r') as files:
        filename = files.readline().strip()
        while filename:
            print(filename)
            data, count = (supabase.table('card')
                .delete()
                .eq('locator', filename)
                .execute())

            deleted_rows = len(data[1])
            print(f'deleted {deleted_rows} rows')
            if not deleted_rows:
                print(f'failed to delete card with locator {filename}')
                print(f'Exiting. {db_delete_count} rows removed from the database')
                end_image_count = len(list(Path(folder_name).glob('*')))
                print(f'difference of {initial_image_count - end_image_count} images on filesystem')
                return
            db_delete_count += deleted_rows
            Path.unlink(f'{folder_name}{filename}')

            filename = files.readline().strip()

    print(f'{db_delete_count} rows removed from the database')
    end_image_count = len(list(Path(folder_name).glob('*')))
    print(f'difference of {initial_image_count - end_image_count} images on filesystem')

if __name__ == '__main__':
    main()
