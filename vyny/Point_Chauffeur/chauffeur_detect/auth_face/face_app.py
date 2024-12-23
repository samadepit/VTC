from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
from PIL import Image
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# mtcnn = MTCNN(device=device, keep_all=True)
# resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
# print(f'running on {device}')


# def generate_emb(file):
#     img = Image.open(file)
#     x_aligned, prob = mtcnn(img, return_prob=True)
#     if len(prob) == 1 and prob > 0.9:  # only one person
#         e = resnet(torch.Tensor(x_aligned[0]).unsqueeze(0)).detach().cpu().numpy()
#         return e
#     return None


# def get_similarity(source, target_array):
#     if len(target_array) > 0:
#         img = Image.open(source)
#         x_aligned, prob = mtcnn(img, return_prob=True)
#         if len(prob) == 1:  # only one person
#             e = resnet(torch.Tensor(x_aligned[0]).unsqueeze(0)).detach().cpu().numpy()
#             _scores, _idx = torch.tensor(cosine_similarity(e, target_array)).topk(1)
#             score = _scores.item()
#             idx = _idx.item()
#             if score >= 0.9:
#                 return score, idx
#     return None, None


#gestion des erreurs 


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(device=device, keep_all=True)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
print(f'Running on {device}')


def generate_emb(file):
    try:
        img = Image.open(file)
        x_aligned, prob = mtcnn(img, return_prob=True)
        if prob is None or len(prob) != 1 or prob[0] < 0.9:
            print("Face detection failed or low confidence.")
            return None
        e = resnet(torch.Tensor(x_aligned[0]).unsqueeze(0).to(device)).detach().cpu().numpy()
        return e / np.linalg.norm(e)  # Normalized embedding
    except Exception as e:
        print(f"Error in generate_emb: {e}")
        return None


def get_similarity(source, target_array):
    if not target_array:
        print("Target array is empty.")
        return None, None
    try:
        img = Image.open(source)
        x_aligned, prob = mtcnn(img, return_prob=True)
        if prob is None or len(prob) != 1 or prob[0] < 0.9:
            print("Face detection failed or low confidence.")
            return None, None
        e = resnet(torch.Tensor(x_aligned[0]).unsqueeze(0).to(device)).detach().cpu().numpy()
        e_normalized = e / np.linalg.norm(e)
        scores = cosine_similarity(e_normalized, target_array)
        _scores, _idx = torch.tensor(scores).topk(1)
        score = _scores.item()
        idx = _idx.item()
        if score >= 0.9:  # Adjust threshold as needed
            return score, idx
        return None, None
    except Exception as e:
        print(f"Error in get_similarity: {e}")
        return None, None