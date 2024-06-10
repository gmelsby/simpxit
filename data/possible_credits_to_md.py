import sys

folder_name = '.images'

def main():
    for file_name in sys.stdin:
        if not file_name.strip():
            break
        print(f'![{file_name}]({folder_name}/{file_name})')

if __name__ == '__main__':
    main()
