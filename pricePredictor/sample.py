# Imports
from skmultiflow.data import RegressionGenerator
from skmultiflow.trees import HoeffdingTreeRegressor
import numpy as np
# Setup a data stream
stream = RegressionGenerator(random_state=1, n_samples=200)
# Setup the Hoeffding Tree Regressor
ht_reg = HoeffdingTreeRegressor()
# Auxiliary variables to control loop and track performance
n_samples = 0
max_samples = 200
y_pred = np.zeros(max_samples)
y_true = np.zeros(max_samples)
# Run test-then-train loop for max_samples and while there is data
while n_samples < max_samples and stream.has_more_samples():
    X, y = stream.next_sample()
    print(X)
    print(y)
    y_true[n_samples] = y[0]
    y_pred[n_samples] = ht_reg.predict(X)[0]
    ht_reg.partial_fit(X, y)
    n_samples += 1
# Display results
print('{} samples analyzed.'.format(n_samples))
print('Hoeffding Tree regressor mean absolute error: {}'.
      format(np.mean(np.abs(y_true - y_pred))))