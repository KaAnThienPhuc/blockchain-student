const Marketplace = artifacts.require("Marketplace");

contract("Marketplace", accounts => {
  let marketplace;

  beforeEach(async () => {
    marketplace = await Marketplace.new();
  });

  it("Should add a student", async () => {
    await marketplace.addStudent("John Doe", "01/01/2000", "Male", "New York", "123456789");
    const student = await marketplace.getStudent(1);
    assert.equal(student[0], 1, "Student ID should match");
    assert.equal(student[1], "John Doe", "Student name should match");
    // Tiếp tục kiểm tra các thuộc tính khác của sinh viên
  });

  it("Should update a student", async () => {
    await marketplace.addStudent("John Doe", "01/01/2000", "Male", "New York", "123456789");
    await marketplace.updateStudent(1, "Jane Doe", "01/01/2001", "Female", "Los Angeles", "987654321");
    const student = await marketplace.getStudent(1);
    assert.equal(student[0], 1, "Student ID should match");
    assert.equal(student[1], "Jane Doe", "Student name should match");
    // Tiếp tục kiểm tra các thuộc tính khác của sinh viên
  });

  it("Should add a course to a student", async () => {
    await marketplace.addStudent("John Doe", "01/01/2000", "Male", "New York", "123456789");
    await marketplace.addCourseToStudent(1, "Math", 3, 90, "Prof. Smith");
    const course = await marketplace.getCourseOfStudent(1, 1);
    assert.equal(course[0], "Math", "Course name should match");
    assert.equal(course[1], 3, "Course credits should match");
    // Tiếp tục kiểm tra các thuộc tính khác của môn học
  });

  it("Should add a degree to a student", async () => {
    await marketplace.addStudent("John Doe", "01/01/2000", "Male", "New York", "123456789");
    await marketplace.addDegreeToStudent(1, "Bachelor's", 48);
    const degree = await marketplace.getDegreeOfStudent(1, 1);
    assert.equal(degree[0], "Bachelor's", "Degree name should match");
    assert.equal(degree[1], 48, "Degree validity months should match");
  });
});
