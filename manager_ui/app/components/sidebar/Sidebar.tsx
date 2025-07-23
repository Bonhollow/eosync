"use client";
import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UsergroupAddOutlined,
  FundProjectionScreenOutlined,
  HomeOutlined,
  ProductOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import './sidebar.css';

const { Header, Sider, Content } = Layout;

interface SidebarProps {
    children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Home',
        },
        {
        key: '/employee',
        icon: <UsergroupAddOutlined />,
        label: 'Employees',
        },
        {
        key: '/projects',
        icon: <FundProjectionScreenOutlined />,
        label: 'Projects',
        },
        {
        key: '/skill',
        icon: <ProductOutlined />,
        label: 'Skills',
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
        >
            <div className="logo-container">
            {!collapsed && <img src="/logo.png" alt="Logo" className="logo" />}
            </div>
            <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            style={{ background: "var(--background)", color: "var(--text)" }}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            />
        </Sider>
        <Layout>
            <Header style={{ padding: 0 }}>
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                }}
            />
            </Header>
            <Content
            style={{
                padding: 24,
                minHeight: 280,
            }}
            >
            {children}
            </Content>
        </Layout>
        </Layout>
    );
};

export default Sidebar;
