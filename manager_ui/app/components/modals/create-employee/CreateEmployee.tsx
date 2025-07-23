import { Form, Input, DatePicker, InputNumber, Button } from "antd";
import { useForm } from "antd/es/form/Form";

export default function CreateEmployee() {
    const [form] = useForm();

    const onFinish = (values: any) => {
        const payload = {
        ...values,
        birth_date: values.birth_date.format("YYYY-MM-DD"),
        hire_date: values.hire_date.format("YYYY-MM-DD"),
        };
        console.log("Submit:", payload);
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400 }}>
        <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
            <Input placeholder="First Name" />
        </Form.Item>

        <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
            <Input placeholder="Last Name" />
        </Form.Item>

        <Form.Item name="birth_date" label="Birth Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
            <Input placeholder="Email" />
        </Form.Item>

        <Form.Item name="phone" label="Phone">
            <Input placeholder="Phone" />
        </Form.Item>

        <Form.Item name="hire_date" label="Hire Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="role" label="Role">
            <Input placeholder="Role" />
        </Form.Item>

        <Form.Item name="department" label="Department">
            <Input placeholder="Department" />
        </Form.Item>

        <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
            <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) => (value !== undefined ? `$ ${value}` : "")}
            />
        </Form.Item>

        <Form.Item>
            <Button type="primary" htmlType="submit" block>
            Add
            </Button>
        </Form.Item>
        </Form>
    );
}
