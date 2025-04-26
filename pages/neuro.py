import numpy as np
import json
import matplotlib.pyplot as plt
class NeuralNet:
	def __init__(self, weights_input_to_hidden, weights_hidden_to_output, bias_input_to_hidden, bias_hidden_to_output):
		self.weights_1 = weights_input_to_hidden
		self.b_1 = bias_input_to_hidden
		self.weights_2 = weights_hidden_to_output
		self.b_2 = bias_hidden_to_output
from skimage.transform import resize
def load_dataset():
	with np.load("mnist.npz") as f:
		# convert from RGB to Unit RGB
		x_train = f['x_train'].astype("float32") / 255
		x_train = resize(x_train, (60000, 50, 50))
		# reshape from (60000, 50, 50) into (60000, 2500)
		x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1] * x_train.shape[2]))

		# labels
		y_train = f['y_train']

		# convert to output layer format
		y_train = np.eye(10)[y_train]

		return x_train, y_train

images, labels = load_dataset()

weights_input_to_hidden = np.random.uniform(-0.5, 0.5, (100, 2500))
weights_hidden_to_output = np.random.uniform(-0.5, 0.5, (10, 100))
bias_input_to_hidden = np.zeros((100, 1))
bias_hidden_to_output = np.zeros((10, 1))

epochs = 3
e_loss = 0
e_correct = 0
learning_rate = 0.01

for epoch in range(epochs):
	print(f"Epoch №{epoch}")

	for image, label in zip(images, labels):
		image = np.reshape(image, (-1, 1))
		label = np.reshape(label, (-1, 1))

		# Forward propagation (to hidden layer)
		hidden_raw = bias_input_to_hidden + weights_input_to_hidden @ image
		hidden = 1 / (1 + np.exp(-hidden_raw)) # sigmoid

		# Forward propagation (to output layer)
		output_raw = bias_hidden_to_output + weights_hidden_to_output @ hidden
		output = 1 / (1 + np.exp(-output_raw))

		# Loss / Error calculation
		e_loss += 1 / len(output) * np.sum((output - label) ** 2, axis=0)
		e_correct += int(np.argmax(output) == np.argmax(label))

		# Backpropagation (output layer)
		delta_output = output - label
		weights_hidden_to_output += -learning_rate * delta_output @ np.transpose(hidden)
		bias_hidden_to_output += -learning_rate * delta_output

		# Backpropagation (hidden layer)
		delta_hidden = np.transpose(weights_hidden_to_output) @ delta_output * (hidden * (1 - hidden))
		weights_input_to_hidden += -learning_rate * delta_hidden @ np.transpose(image)
		bias_input_to_hidden += -learning_rate * delta_hidden

	print(f"Loss: {round((e_loss[0] / images.shape[0]) * 100, 3)}%")
	print(f"Accuracy: {round((e_correct / images.shape[0]) * 100, 3)}%")
	e_loss = 0
	e_correct = 0
model = NeuralNet(weights_input_to_hidden, weights_hidden_to_output, bias_input_to_hidden, bias_hidden_to_output)
weights = {
    "weights1": model.weights_1.tolist(),
    "b1": model.b_1.tolist(),
    "weights2": model.weights_2.tolist(),
    "b2": model.b_2.tolist(),
}

with open("model_weights.json", "w") as file:
    json.dump(weights, file, indent=2)
# print("weights_input_to_hidden = ", weights_input_to_hidden)
# print("weights_hidden_to_output = ", weights_hidden_to_output)
# print("bias_input_to_hidden = ", bias_input_to_hidden)
# print("bias_hidden_to_output = ", bias_hidden_to_output)
# CHECK CUSTOM
#test_image = plt.imread("custom.jpg", format="jpeg")

# Grayscale + Unit RGB + inverse colors
# gray = lambda rgb : np.dot(rgb[... , :3] , [0.299 , 0.587, 0.114])
# test_image = 1 - (gray(test_image).astype("float32") / 255)

# Reshape
# test_image = np.reshape(test_image, (test_image.shape[0] * test_image.shape[1]))
# print(test_image)
# Predict
# image = np.reshape(test_image, (-1, 1))

# Forward propagation (to hidden layer)
# hidden_raw = bias_input_to_hidden + weights_input_to_hidden @ image
# hidden = 1 / (1 + np.exp(-hidden_raw)) # sigmoid
# Forward propagation (to output layer)
# output_raw = bias_hidden_to_output + weights_hidden_to_output @ hidden
# output = 1 / (1 + np.exp(-output_raw))

# plt.imshow(test_image.reshape(28, 28), cmap="Greys")
# plt.title(f"NN suggests the CUSTOM number is: {output.argmax()}")
# plt.show()