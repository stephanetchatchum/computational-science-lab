#include <math.h>

void accel(int n, const double *r, const double *m, double eps, double *a) {
    for (int i = 0; i < n; i++) {
        double ax = 0, ay = 0, az = 0;
        for (int j = 0; j < n; j++) {
            if (i == j) continue;
            double dx = r[3*j] - r[3*i], dy = r[3*j+1] - r[3*i+1], dz = r[3*j+2] - r[3*i+2];
            double r2 = dx*dx + dy*dy + dz*dz + eps*eps;
            double f = m[j] / (r2 * sqrt(r2));
            ax += f * dx; ay += f * dy; az += f * dz;
        }
        a[3*i] = ax; a[3*i+1] = ay; a[3*i+2] = az;
    }
}
