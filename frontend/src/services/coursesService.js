const API_COURSES = 'http://localhost:5000/api/courses';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export async function getCoursesForStudent() {
    try {
        const response = await fetch(API_COURSES, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch courses');
        return await response.json();
    } catch (err) {
        console.error('Fetch courses error:', err);
        return { courses: [], totalCredits: 0, totalCourses: 0 };
    }
}

export async function updateCourse(courseData) {
    try {
        const response = await fetch(API_COURSES, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(courseData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update course');
        }
        return await response.json();
    } catch (err) {
        throw err;
    }
}

export async function deleteCourse(id) {
    try {
        const response = await fetch(`${API_COURSES}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete course');
        return await response.json();
    } catch (err) {
        throw err;
    }
}
