import face_recognition as frg
import pickle as pkl 
import os 
import cv2 
import numpy as np
import yaml
from collections import defaultdict

information = defaultdict(dict)

# Load paths from YAML
cfg = yaml.load(open('config.yaml', 'r'), Loader=yaml.FullLoader)
DATASET_DIR = cfg['PATH']['DATASET_DIR']
PKL_PATH = cfg['PATH']['PKL_PATH']

# ✅ Fixed database loading function
def get_databse():
    if not os.path.exists(PKL_PATH):
        raise FileNotFoundError(f"❌ Database file not found at {PKL_PATH}. Please run build_dataset() to generate it.")
    with open(PKL_PATH, 'rb') as f:
        database = pkl.load(f)
    return database

def recognize(image, TOLERANCE): 
    database = get_databse()
    known_encoding = [database[id]['encoding'] for id in database.keys()] 
    name = 'Unknown'
    id = 'Unknown'
    face_locations = frg.face_locations(image)
    face_encodings = frg.face_encodings(image, face_locations)
    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        matches = frg.compare_faces(known_encoding, face_encoding, tolerance=TOLERANCE)
        distance = frg.face_distance(known_encoding, face_encoding)
        name = 'Unknown'
        id = 'Unknown'
        if True in matches:
            match_index = matches.index(True)
            name = database[match_index]['name']
            id = database[match_index]['id']
            distance = round(distance[match_index], 2)
            cv2.putText(image, str(distance), (left, top-30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        cv2.rectangle(image, (left, top), (right, bottom), (0, 255, 0), 2)
        cv2.putText(image, name, (left, top-10), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
    return image, name, id

def isFaceExists(image): 
    face_location = frg.face_locations(image)
    return len(face_location) > 0

def submitNew(name, id, image, old_idx=None):
    database = get_databse()
    if type(image) != np.ndarray:
        image = cv2.imdecode(np.frombuffer(image.read(), np.uint8), 1)

    if not isFaceExists(image):
        return -1

    encoding = frg.face_encodings(image)[0]
    existing_id = [database[i]['id'] for i in database.keys()]

    if old_idx is not None:
        new_idx = old_idx
    else:
        if id in existing_id:
            return 0
        new_idx = len(database)

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    database[new_idx] = {
        'image': image,
        'id': id,
        'name': name,
        'encoding': encoding
    }

    with open(PKL_PATH, 'wb') as f:
        pkl.dump(database, f)

    return True

def get_info_from_id(id): 
    database = get_databse() 
    for idx, person in database.items(): 
        if person['id'] == id: 
            return person['name'], person['image'], idx       
    return None, None, None

def deleteOne(id):
    database = get_databse()
    id = str(id)
    for key in list(database.keys()):  # use list to avoid runtime dict size change
        if database[key]['id'] == id:
            del database[key]
            break
    with open(PKL_PATH, 'wb') as f:
        pkl.dump(database, f)
    return True

def build_dataset():
    counter = 0
    for image in os.listdir(DATASET_DIR):
        image_path = os.path.join(DATASET_DIR, image)
        if not image_path.endswith('.jpg'):
            continue
        image_name = image.split('.')[0]
        parsed_name = image_name.split('_')
        person_id = parsed_name[0]
        person_name = ' '.join(parsed_name[1:])
        image = frg.load_image_file(image_path)
        encodings = frg.face_encodings(image)
        if len(encodings) == 0:
            continue  # Skip if no face found
        information[counter]['image'] = image 
        information[counter]['id'] = person_id
        information[counter]['name'] = person_name
        information[counter]['encoding'] = encodings[0]
        counter += 1

    with open(PKL_PATH, 'wb') as f:
        pkl.dump(information, f)