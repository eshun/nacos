package com.alibaba.nacos.console.model;

import com.alibaba.nacos.console.common.Constants;
import com.alibaba.nacos.naming.core.Instance;
import com.alibaba.nacos.naming.pojo.ServiceView;

public class GraphNode {

    private Instance instance;
    public void setInstance(Instance instance){
        this.instance=instance;
    }
    public Instance getInstance(){
        return this.instance;
    }

    private ServiceView service;
    public void setService(ServiceView service){
        this.service=service;
    }
    public ServiceView getService(){
        return this.service;
    }

    private String id;
    public void setId(String id){
        this.id=id;
    }
    public String getId(){
        return this.id;
    }

    private String label;
    public void setLabel(String label){
        this.label=label;
    }
    public String getLabel(){
        return this.label;
    }

    public String groupId;
    public void setGroupId(String groupId){
        this.groupId=groupId;
    }
    public String getGroupId(){
        return this.groupId;
    }

    private String shape;
    public void setShape(String shape){
        this.shape=shape;
    }
    public String getShape(){
        return this.shape;
    }

    public GraphNode() {
        this.shape= Constants.DEFAULT_SHAPE;

    }
}
