package com.alibaba.nacos.console.model;

public class GraphEdge {

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

    private String source;
    public void setSource(String source){
        this.source=source;
    }
    public String getSource(){
        return this.source;
    }

    private String target;
    public void setTarget(String target){
        this.target=target;
    }
    public String getTarget(){
        return this.target;
    }
}
