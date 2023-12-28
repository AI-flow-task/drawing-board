﻿import { RobotOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormInstance, Segmented, message } from 'antd';
import type { NextPage } from 'next';
import { memo, useRef, useState } from 'react';

const GitHubIssue: NextPage = () => {
  const [row, setRow] = useState<
    | {
        id: string;
        title: string;
        body: string;
      }
    | undefined
  >();
  const formRef = useRef<FormInstance>();
  const [repo, setRepo] = useState<'ant-design' | 'pro-components'>('pro-components');
  return (
    <PageContainer
      title="issue 解答"
      extra={
        <Segmented
          value={repo}
          onChange={(e) => {
            setRepo(e as 'ant-design');
          }}
          options={[
            {
              label: 'Ant Design',
              value: 'ant-design',
            },
            {
              label: 'ProComponents',
              value: 'pro-components',
            },
          ]}
        />
      }
    >
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 64px)',
        }}
      >
        <ModalForm
          key={row?.id}
          formRef={formRef}
          title={'AI 解答：' + (row?.title ?? '未选择')}
          open={!!row}
          request={async () => {
            return {
              ...row,
              title: row?.title,
              body: undefined,
            };
          }}
          onOpenChange={(open) => {
            if (open) return;
            setRow(undefined);
          }}
          onFinish={(values) => {
            return fetch('/api/github', {
              method: 'POST',
              body: JSON.stringify({
                ...values,
                owner: 'ant-design',
                repo,
              }),
            }).then(() => {
              message.success('提交成功');
              return true;
            });
          }}
        >
          <ProFormText label="issueId" name="id" readonly />
          <ProFormTextArea
            label="问题"
            name="title"
            fieldProps={{
              rows: 3,
            }}
          />
          <ProFormTextArea
            label={
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                }}
              >
                <span>答案</span>
                <a
                  style={{
                    display: 'flex',
                    gap: 4,
                  }}
                  onClick={() => {
                    fetch('/api/docantd', {
                      method: 'POST',
                      body: JSON.stringify({
                        title: formRef.current?.getFieldValue('title'),
                        id: row?.id,
                        body: row?.body,
                        owner: 'ant-design',
                        repo,
                      }),
                    })
                      .then((res) => res.json())
                      .then((res) => {
                        formRef.current?.setFieldsValue({
                          body: res.message,
                        });
                      });
                  }}
                >
                  <RobotOutlined />
                  机器人解答
                </a>
              </div>
            }
            name="body"
            fieldProps={{
              rows: 10,
            }}
            placeholder="点击标题旁的 机器人解答 开始解答"
          />
        </ModalForm>
        <ProTable<{
          id: string;
          title: string;
          body: string;
        }>
          params={{
            repo,
          }}
          columns={[
            {
              title: 'id',
              dataIndex: 'id',
              key: 'id',
              search: false,
              width: 100,
              render: (dom, row) => {
                return (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://github.com/ant-design/${repo}/issues/` + row.id}
                  >
                    {row.id}
                  </a>
                );
              },
            },
            {
              title: '标题',
              dataIndex: 'title',
              key: 'title',
              ellipsis: true,
            },
            {
              width: 200,
              title: 'action',
              dataIndex: 'action',
              key: 'action',
              valueType: 'option',
              render: (dom, row) => [
                <a
                  key="link"
                  onClick={() => {
                    if (!row) return;
                    setRow(row);
                  }}
                >
                  AI 进行解答
                </a>,
              ],
            },
          ]}
          request={(params) => {
            return fetch(
              `/api/github?owner=ant-design&repo=${repo}&page=${params.current}&pageSize=${params.pageSize}`,
              {
                method: 'GET',
              },
            )
              .then((res) => res.json())
              .then((res) => {
                return {
                  data: res,
                };
              });
          }}
        />
      </div>
    </PageContainer>
  );
};

export default memo(GitHubIssue);
